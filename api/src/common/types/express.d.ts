import type {
  RequestUser,
  ValidatedRefreshToken,
} from '../../modules/auth/auth.types.js';

declare global {
  namespace Express {
    interface Request {
      auth?: RequestUser;
      refreshToken?: ValidatedRefreshToken;
      validated?: { body?: unknown; query?: unknown; params?: unknown };
    }
  }
}
export { };
