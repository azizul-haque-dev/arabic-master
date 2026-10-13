import { ConflictError, UnauthorizedError } from '../../common/errors/app-error.js';
import { isUniqueViolation } from '../../common/utils/db-error.util.js';
import { parseDurationSeconds } from '../../common/utils/duration.js';
import { env } from '../../config/env.js';
import { withTransaction } from '../../database/db.js';
import { UserStatus } from '../../database/drizzle/enums.js';
import type { UserService } from '../users/user.service.js';
import type { AuthRepository } from './auth.repository.js';
import type { LoginInput, RegisterInput } from './auth.schemas.js';
import type { AuthResult, RequestMeta, ValidatedRefreshToken } from './auth.types.js';
import type { EmailService } from './email.service.js';
import type { GoogleProfilePayload, OAuthService } from './oauth.service.js';
import type { PasswordService } from './password.service.js';
import type { SecurityLoggerService } from './security-logger.service.js';
import type { SessionService } from './session.service.js';
import type { TokenService } from './token.service.js';

export function createAuthService(d: {
  users: UserService; passwords: PasswordService; tokens: TokenService; sessions: SessionService;
  oauth: OAuthService; authRepo: AuthRepository; security: SecurityLoggerService; email: EmailService;
}) {
  const { users, passwords, tokens, sessions, oauth, authRepo, security, email } = d;

  async function register(dto: RegisterInput, meta: RequestMeta): Promise<AuthResult> {
    if (await users.findByEmail(dto.email)) throw new ConflictError('An account with this email already exists');
    const passwordHash = await passwords.hash(dto.password);

    let user;
    try {
      user = await withTransaction((tx) =>
        users.createWithPassword({ email: dto.email, passwordHash, fullName: dto.fullName }, tx),
      );
    } catch (err) {
      if (isUniqueViolation(err)) throw new ConflictError('An account with this email already exists');
      throw err;
    }

    const session = await sessions.createSession({ userId: user.id, ipAddress: meta.ipAddress, userAgent: meta.userAgent });
    security.log({ event: 'REGISTER', ...meta, userId: user.id, sessionId: session.sessionId });
    return { user: users.toSafeUser(user), tokens: session };
  }

  async function login(dto: LoginInput, meta: RequestMeta): Promise<AuthResult> {
    const user = await users.findByEmail(dto.email);
    const valid = user?.passwordHash
      ? await passwords.verify(user.passwordHash, dto.password)
      : await passwords.verifyDummy(dto.password);

    if (!user || !user.passwordHash || !valid) {
      security.log({ event: 'LOGIN_FAILED', ...meta, userId: user?.id });
      throw new UnauthorizedError('Invalid credentials');
    }
    if (user.status !== UserStatus.ACTIVE) {
      security.log({ event: 'ACCOUNT_UNAVAILABLE_LOGIN_ATTEMPT', ...meta, userId: user.id });
      throw new UnauthorizedError('Account unavailable');
    }

    const session = await sessions.createSession({ userId: user.id, ipAddress: meta.ipAddress, userAgent: meta.userAgent });
    security.log({ event: 'LOGIN_SUCCESS', ...meta, userId: user.id, sessionId: session.sessionId });
    return { user: users.toSafeUser(user), tokens: session };
  }

  async function refresh(payload: ValidatedRefreshToken, meta: RequestMeta) {
    const result = await sessions.rotateRefreshToken({
      rawToken: payload.rawToken, userId: payload.sub, sessionId: payload.sessionId, jwtId: payload.jwtId,
      requestId: meta.requestId, ipAddress: meta.ipAddress, userAgent: meta.userAgent,
    });
    security.log({ event: 'REFRESH_SUCCESS', ...meta, userId: payload.sub, sessionId: payload.sessionId });
    return result;
  }

  async function logout(sessionId: string, meta: RequestMeta) {
    await sessions.revokeSession(sessionId);
    security.log({ event: 'LOGOUT', ...meta, sessionId });
  }

  async function logoutAll(userId: string, meta: RequestMeta) {
    await sessions.revokeAllSessionsForUser(userId);
    security.log({ event: 'LOGOUT_ALL', ...meta, userId });
  }

  async function forgotPassword(emailAddress: string, meta: RequestMeta) {
    const user = await users.findByEmail(emailAddress);
    if (!user?.passwordHash) return; // user আছে কি না, response থেকে বোঝা যাবে না

    await authRepo.invalidateOpenResetTokens(user.id);
    const { rawToken, hash } = tokens.generateResetToken();
    const expiresAt = new Date(Date.now() + parseDurationSeconds(env.PASSWORD_RESET_EXPIRES_IN) * 1000);
    await authRepo.insertResetToken({ userId: user.id, tokenHash: hash, expiresAt });

    await email.sendPasswordResetEmail(user.email, `${env.FRONTEND_URL ?? ''}/reset-password?token=${rawToken}`);
    security.log({ event: 'PASSWORD_RESET_REQUESTED', ...meta, userId: user.id });
  }

  async function resetPassword(rawToken: string, newPassword: string, meta: RequestMeta) {
    const token = await authRepo.findResetTokenByHash(tokens.hashToken(rawToken));
    if (!token || token.usedAt || token.expiresAt < new Date()) throw new UnauthorizedError('Invalid or expired reset token');

    const hash = await passwords.hash(newPassword);
    await withTransaction(async (tx) => {
      await users.updatePassword(token.userId, hash, tx);
      await authRepo.markResetTokenUsed(token.id, tx);
    });
    await sessions.revokeAllSessionsForUser(token.userId);
    security.log({ event: 'PASSWORD_RESET_SUCCESS', ...meta, userId: token.userId });
  }

  async function loginWithGoogle(profile: GoogleProfilePayload, meta: RequestMeta): Promise<AuthResult> {
    const user = await oauth.findOrCreateGoogleUser(profile);
    if (user.status !== UserStatus.ACTIVE) throw new UnauthorizedError('Account unavailable');

    const session = await sessions.createSession({ userId: user.id, ipAddress: meta.ipAddress, userAgent: meta.userAgent });
    security.log({ event: 'OAUTH_LOGIN', ...meta, userId: user.id, sessionId: session.sessionId });
    return { user: users.toSafeUser(user), tokens: session };
  }

  return { register, login, refresh, logout, logoutAll, forgotPassword, resetPassword, loginWithGoogle };
}
export type AuthService = ReturnType<typeof createAuthService>;
