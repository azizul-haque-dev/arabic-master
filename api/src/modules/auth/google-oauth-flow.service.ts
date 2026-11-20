import { randomBytes } from 'node:crypto';
import { ServiceUnavailableError } from '../../common/errors/app-error.js';
import { RedisService } from '../../database/redis.service.js';
import type { SafeUser } from '../users/user.service.js';

const STATE_TTL_SECONDS = 10 * 60;
const EXCHANGE_TTL_SECONDS = 60;
const stateKey = (state: string) => `google-oauth:state:${state}`;
const exchangeKey = (code: string) => `google-oauth:exchange:${code}`;

export interface GoogleOAuthExchange {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

export const GoogleOAuthFlowService = {
  async createState(returnTo?: string): Promise<string> {
    const state = randomBytes(32).toString('base64url');
    const stored = await RedisService.client.set(
      stateKey(state),
      JSON.stringify({ returnTo }),
      'EX',
      STATE_TTL_SECONDS,
      'NX',
    );
    if (stored !== 'OK') {
      throw new ServiceUnavailableError(
        'Unable to start Google authentication; retry the request',
      );
    }
    return state;
  },

  async consumeState(state: string): Promise<string | undefined | null> {
    const stored = await RedisService.client.getdel(stateKey(state));
    if (!stored) return null;
    const data = JSON.parse(stored) as { returnTo?: unknown };
    return typeof data.returnTo === 'string' ? data.returnTo : undefined;
  },

  async createExchange(result: GoogleOAuthExchange): Promise<string> {
    const code = randomBytes(32).toString('base64url');
    const stored = await RedisService.client.set(
      exchangeKey(code),
      JSON.stringify(result),
      'EX',
      EXCHANGE_TTL_SECONDS,
      'NX',
    );
    if (stored !== 'OK') {
      throw new ServiceUnavailableError(
        'Unable to complete Google authentication; retry the request',
      );
    }
    return code;
  },

  async consumeExchange(code: string): Promise<GoogleOAuthExchange | null> {
    const stored = await RedisService.client.getdel(exchangeKey(code));
    return stored ? (JSON.parse(stored) as GoogleOAuthExchange) : null;
  },
};

export type GoogleOAuthFlowService = typeof GoogleOAuthFlowService;
