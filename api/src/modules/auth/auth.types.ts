import type { Role } from '../../database/drizzle/enums.js';
import type { SafeUser } from '../users/user.service.js';

export interface AccessTokenPayload {
  sub: string;
  type: 'access';
  sessionId: string;
  jwtId: string;
}
export interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
  sessionId: string;
  jwtId: string;
}
export interface ValidatedRefreshToken extends RefreshTokenPayload {
  rawToken: string;
}
export interface RequestUser {
  userId: string;
  sessionId: string;
  jwtId: string;
  role: Role;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}
export interface AuthResult {
  user: SafeUser;
  tokens: TokenPair & { sessionId: string };
}
export interface RequestMeta {
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
}
