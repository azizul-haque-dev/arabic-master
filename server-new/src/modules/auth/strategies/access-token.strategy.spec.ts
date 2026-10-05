import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PinoLogger } from 'nestjs-pino';
import { describe, expect, it, vi } from 'vitest';
import { DatabaseService } from '../../../database/drizzle/db.service.js';
import * as schema from '../../../database/drizzle/schema.js';
import { RedisService } from '../../../database/redis/redis.service.js';
import { UsersService } from '../../users/users.service.js';
import { AccessTokenStrategy } from './access-token.strategy.js';

describe('AccessTokenStrategy', () => {
  it('rejects a revoked database session even if Redis is unavailable', async () => {
    const redis = {
      isSessionRevoked: vi
        .fn()
        .mockRejectedValue(new Error('Redis unavailable')),
    } as unknown as RedisService;
    const db = {
      db: {
        select: vi.fn(() => ({
          from: (table: unknown) => ({
            where: () => ({
              limit: async () =>
                table === schema.session
                  ? [{ isActive: false, revokedAt: new Date() }]
                  : [],
            }),
          }),
        })),
      },
    } as unknown as DatabaseService;
    const users = { findById: vi.fn() } as unknown as UsersService;
    const logger = {
      warn: vi.fn(),
    } as unknown as PinoLogger;
    const config = {
      get: vi.fn(() => 'access-secret'),
    } as unknown as ConfigService;
    const strategy = new AccessTokenStrategy(
      config,
      redis,
      db,
      users,
      logger,
    );

    await expect(
      strategy.validate({
        sub: 'user-1',
        type: 'access',
        sessionId: 'session-1',
        jwtId: 'token-1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(logger.warn).toHaveBeenCalled();
    expect(users.findById).not.toHaveBeenCalled();
  });
});
