import { UnauthorizedException } from '@nestjs/common';
import type { PinoLogger } from 'nestjs-pino';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatabaseService } from '../../../database/drizzle/db.service.js';
import * as schema from '../../../database/drizzle/schema.js';
import { RedisService } from '../../../database/redis/redis.service.js';
import { SecurityLoggerService } from './security-logger.service.js';
import { SessionService } from './session.service.js';
import { TokenService } from './token.service.js';

function createHarness() {
  const sessions: Array<Record<string, any>> = [];
  const refreshTokens: Array<Record<string, any>> = [];
  let tokenNumber = 0;

  const db = {
    db: {
      select: vi.fn((projection?: unknown) => ({
        from: (table: unknown) => ({
          where: () => {
            const rows = () => {
              if (table === schema.session && projection) {
                return sessions
                  .filter((session) => !session.revokedAt)
                  .map(({ id }) => ({ id }));
              }
              if (table === schema.session) return sessions.slice(0, 1);
              if (table === schema.refreshToken) return refreshTokens.slice(0, 1);
              return [];
            };
            return Object.assign(Promise.resolve(rows()), {
              limit: async () => rows(),
            });
          },
        }),
      })),
      update: vi.fn((table: unknown) => ({
        set: (values: Record<string, unknown>) => ({
          where: () => ({
            returning: async () => {
              const rows =
                table === schema.session ? sessions : refreshTokens;
              for (const row of rows) Object.assign(row, values);
              return [];
            },
          }),
        }),
      })),
      insert: vi.fn((table: unknown) => ({
        values: (values: Record<string, unknown>) => ({
          returning: async () => {
            const rows = table === schema.session ? sessions : refreshTokens;
            const row = { ...values, isActive: true, revokedAt: null };
            rows.push(row);
            return [row];
          },
        }),
      })),
    },
  } as unknown as DatabaseService;

  const redis = {
    revokeSession: vi.fn().mockResolvedValue(undefined),
    setActiveSession: vi.fn().mockResolvedValue(undefined),
  } as unknown as RedisService;
  const tokenService = {
    getRefreshTokenExpiryDate: vi.fn(
      () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    ),
    generateAccessToken: vi.fn(() => ({
      token: `access-${++tokenNumber}`,
      jwtId: `access-jti-${tokenNumber}`,
    })),
    generateRefreshToken: vi.fn(() => ({
      token: `refresh-${tokenNumber}`,
      jwtId: `refresh-jti-${tokenNumber}`,
    })),
    hashToken: vi.fn((token: string) => `hash-${token}`),
    getAccessTokenTtlSeconds: vi.fn(() => 900),
  } as unknown as TokenService;
  const logger = {
    setContext: vi.fn(),
    error: vi.fn(),
  } as unknown as PinoLogger;
  const securityLogger = {
    log: vi.fn(),
  } as unknown as SecurityLoggerService;

  return {
    service: new SessionService(db, redis, tokenService, securityLogger, logger),
    db,
    redis,
    sessions,
    refreshTokens,
    logger,
  };
}

describe('SessionService', () => {
  let harness: ReturnType<typeof createHarness>;

  beforeEach(() => {
    harness = createHarness();
  });

  it('revokes the previous session when a user creates a second session', async () => {
    const first = await harness.service.createSession({ userId: 'user-1' });
    const second = await harness.service.createSession({ userId: 'user-1' });

    expect(harness.sessions.find((session) => session.id === first.sessionId)).toMatchObject({
      isActive: false,
      revokedAt: expect.any(Date),
    });
    expect(harness.redis.revokeSession).toHaveBeenCalledWith(first.sessionId, 900);
    expect(harness.redis.setActiveSession).toHaveBeenLastCalledWith(
      'user-1',
      second.sessionId,
      expect.any(Number),
    );
  });

  it('rejects refresh-token rotation after the session is revoked', async () => {
    const first = await harness.service.createSession({ userId: 'user-1' });
    await harness.service.createSession({ userId: 'user-1' });

    await expect(
      harness.service.rotateRefreshToken({
        rawToken: first.refreshToken,
        userId: 'user-1',
        sessionId: first.sessionId,
        jwtId: 'refresh-jti-1',
        requestId: 'request-1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('creates a session safely when there are no active sessions and Redis is unavailable', async () => {
    vi.mocked(harness.redis.setActiveSession).mockRejectedValueOnce(
      new Error('Redis unavailable'),
    );

    await expect(
      harness.service.createSession({ userId: 'user-1' }),
    ).resolves.toMatchObject({ sessionId: expect.any(String) });

    expect(harness.db.db.update).not.toHaveBeenCalledWith(schema.refreshToken);
    expect(harness.logger.error).toHaveBeenCalled();
  });
});
