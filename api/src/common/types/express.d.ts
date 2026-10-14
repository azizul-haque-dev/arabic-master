import type {
  RequestUser,
  ValidatedRefreshToken,
} from '../../modules/auth/auth.types.js';

declare global {
  namespace Express {
    interface Request {
      // passport-এর req.user-এর সাথে সংঘর্ষ এড়াতে নাম `auth`
      auth?: RequestUser;
      refreshToken?: ValidatedRefreshToken;
      validated?: { body?: unknown; query?: unknown; params?: unknown };
    }
  }
}
export {};
