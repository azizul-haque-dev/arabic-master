import { afterEach, describe, expect, it, vi } from 'vitest';
import { RedisService } from '../../database/redis.service.js';
import { GoogleOAuthFlowService } from './google-oauth-flow.service.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('GoogleOAuthFlowService', () => {
  it('creates unpredictable state and stores only the requested return path', async () => {
    const setSpy = vi
      .spyOn(RedisService.client, 'set')
      .mockResolvedValue('OK');

    const state = await GoogleOAuthFlowService.createState('/admin');

    expect(state).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(setSpy).toHaveBeenCalledWith(
      `google-oauth:state:${state}`,
      JSON.stringify({ returnTo: '/admin' }),
      'EX',
      600,
      'NX',
    );
  });

  it('consumes OAuth state once so it cannot be replayed', async () => {
    const getdelSpy = vi
      .spyOn(RedisService.client, 'getdel')
      .mockResolvedValueOnce(JSON.stringify({ returnTo: '/admin' }))
      .mockResolvedValueOnce(null);

    await expect(
      GoogleOAuthFlowService.consumeState('state-value'),
    ).resolves.toBe('/admin');
    await expect(
      GoogleOAuthFlowService.consumeState('state-value'),
    ).resolves.toBeNull();
    expect(getdelSpy).toHaveBeenCalledTimes(2);
  });

  it('consumes the token exchange code once', async () => {
    const exchange = {
      user: {
        id: 'user-id',
        email: 'user@example.com',
        fullName: 'Test User',
        role: 'USER',
        status: 'ACTIVE',
        emailVerifiedAt: null,
        createdAt: new Date().toISOString(),
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };
    const getdelSpy = vi
      .spyOn(RedisService.client, 'getdel')
      .mockResolvedValueOnce(JSON.stringify(exchange))
      .mockResolvedValueOnce(null);

    await expect(
      GoogleOAuthFlowService.consumeExchange('exchange-code'),
    ).resolves.toEqual(exchange);
    await expect(
      GoogleOAuthFlowService.consumeExchange('exchange-code'),
    ).resolves.toBeNull();
    expect(getdelSpy).toHaveBeenCalledTimes(2);
  });
});
