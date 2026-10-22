import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedError } from '../../common/errors/app-error.js';
import { SessionRepository } from './session.repository.js';
import { SessionService } from './session.service.js';
import { TokenService } from './token.service.js';
import { RedisService } from '../../database/redis.service.js';

vi.mock('../../database/db.js', () => ({
  withTransaction: vi.fn().mockImplementation((cb: (tx: unknown) => unknown) => cb({})),
  db: {},
}));

describe('SessionService.rotateRefreshToken', () => {
  const meta = {
    requestId: 'req-test-1',
    ipAddress: '127.0.0.1',
    userAgent: 'vitest-agent',
  };

  const rawToken = 'raw-refresh-token-value';
  const hashedToken = TokenService.hashToken(rawToken);
  const userId = 'user-uuid-1';
  const sessionId = 'session-uuid-1';
  const jwtId = 'jwt-id-1';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully rotates an active refresh token', async () => {
    vi.spyOn(SessionRepository, 'findRefreshByJwtId').mockResolvedValue({
      id: 'ref-id-1',
      sessionId,
      jwtId,
      tokenHash: hashedToken,
      expiresAt: new Date(Date.now() + 1000 * 3600),
      revokedAt: null,
      replacedByTokenId: null,
      createdAt: new Date(),
    });

    vi.spyOn(SessionRepository, 'findById').mockResolvedValue({
      id: sessionId,
      userId,
      deviceId: 'dev-1',
      userAgent: 'agent',
      ipAddress: '127.0.0.1',
      isActive: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 3600),
      revokedAt: null,
    });

    vi.spyOn(SessionRepository, 'claimRefresh').mockResolvedValue([
      { id: 'ref-id-1' } as any,
    ]);
    vi.spyOn(SessionRepository, 'insertRefresh').mockResolvedValue({
      id: 'ref-id-new',
    } as any);
    vi.spyOn(SessionRepository, 'linkReplacement').mockResolvedValue(undefined);
    vi.spyOn(RedisService.client, 'set').mockResolvedValue('OK' as any);

    const result = await SessionService.rotateRefreshToken({
      rawToken,
      userId,
      sessionId,
      jwtId,
      ...meta,
    });

    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(SessionRepository.claimRefresh).toHaveBeenCalledWith('ref-id-1', expect.anything());
    expect(SessionRepository.insertRefresh).toHaveBeenCalled();
  });

  it('tolerates in-flight concurrent requests within grace period without revoking', async () => {
    const revokedTenSecondsAgo = new Date(Date.now() - 10_000);

    vi.spyOn(SessionRepository, 'findRefreshByJwtId').mockResolvedValue({
      id: 'ref-id-1',
      sessionId,
      jwtId,
      tokenHash: hashedToken,
      expiresAt: new Date(Date.now() + 1000 * 3600),
      revokedAt: revokedTenSecondsAgo,
      replacedByTokenId: 'ref-id-replacement',
      createdAt: new Date(),
    });

    vi.spyOn(SessionRepository, 'findById').mockResolvedValue({
      id: sessionId,
      userId,
      deviceId: 'dev-1',
      userAgent: 'agent',
      ipAddress: '127.0.0.1',
      isActive: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 3600),
      revokedAt: null,
    });

    const cachedPayload = {
      accessToken: 'cached-access-token',
      refreshToken: 'cached-refresh-token',
      refreshTokenExpiresAt: new Date().toISOString(),
    };
    vi.spyOn(RedisService.client, 'get').mockResolvedValue(JSON.stringify(cachedPayload) as any);
    const revokeSpy = vi.spyOn(SessionService, 'revokeSession');

    const result = await SessionService.rotateRefreshToken({
      rawToken,
      userId,
      sessionId,
      jwtId,
      ...meta,
    });

    expect(result.accessToken).toBe('cached-access-token');
    expect(result.refreshToken).toBe('cached-refresh-token');
    expect(revokeSpy).not.toHaveBeenCalled();
  });

  it('revokes session when token was revoked outside grace period (>30s)', async () => {
    const revokedTwoMinutesAgo = new Date(Date.now() - 120_000);

    vi.spyOn(SessionRepository, 'findRefreshByJwtId').mockResolvedValue({
      id: 'ref-id-1',
      sessionId,
      jwtId,
      tokenHash: hashedToken,
      expiresAt: new Date(Date.now() + 1000 * 3600),
      revokedAt: revokedTwoMinutesAgo,
      replacedByTokenId: 'ref-id-replacement',
      createdAt: new Date(),
    });

    vi.spyOn(SessionRepository, 'findById').mockResolvedValue({
      id: sessionId,
      userId,
      deviceId: 'dev-1',
      userAgent: 'agent',
      ipAddress: '127.0.0.1',
      isActive: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 3600),
      revokedAt: null,
    });

    vi.spyOn(SessionRepository, 'revoke').mockResolvedValue(undefined);
    vi.spyOn(SessionRepository, 'revokeRefreshBySession').mockResolvedValue(undefined);
    vi.spyOn(RedisService, 'revokeSession').mockResolvedValue(undefined);

    await expect(
      SessionService.rotateRefreshToken({
        rawToken,
        userId,
        sessionId,
        jwtId,
        ...meta,
      }),
    ).rejects.toThrow(UnauthorizedError);
  });
});
