import {
  ConflictError,
  UnauthorizedError,
} from '../../common/errors/app-error.js';
import { isUniqueViolation } from '../../common/utils/db-error.util.js';
import { parseDurationSeconds } from '../../common/utils/duration.js';
import { env } from '../../config/env.js';
import { withTransaction } from '../../database/db.js';
import { UserStatus } from '../../database/drizzle/enums.js';

import { UserService } from '../users/user.service.js';

import { GoogleAuthService } from './google-auth.service.js';
import type { GoogleAuthInput, LoginInput, RegisterInput } from './auth.schemas.js';
import type {
  AuthResult,
  RequestMeta,
  ValidatedRefreshToken,
} from './auth.types.js';
import { AuthRepository } from './auth.repository.js';
import { EmailService } from './email.service.js';

import { PasswordService } from './password.service.js';
import { SecurityLoggerService } from './security-logger.service.js';
import { SessionService } from './session.service.js';
import { TokenService } from './token.service.js';

const security = SecurityLoggerService;

export const AuthService = {
  async register(
    dto: RegisterInput,
    meta: RequestMeta,
  ): Promise<AuthResult> {
    if (await UserService.findByEmail(dto.email))
      throw new ConflictError('An account with this email already exists');
    const passwordHash = await PasswordService.hash(dto.password);

    let user;
    try {
      user = await withTransaction((tx) =>
        UserService.createWithPassword(
          { email: dto.email, passwordHash, fullName: dto.fullName },
          tx,
        ),
      );
    } catch (err) {
      if (isUniqueViolation(err))
        throw new ConflictError('An account with this email already exists');
      throw err;
    }

    const session = await SessionService.createSession({
      userId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
    security.log({
      event: 'REGISTER',
      ...meta,
      userId: user.id,
      sessionId: session.sessionId,
    });
    return { user: UserService.toSafeUser(user), tokens: session };
  },

  async login(
    dto: LoginInput,
    meta: RequestMeta,
  ): Promise<AuthResult> {
    const user = await UserService.findByEmail(dto.email);
    const valid = user?.passwordHash
      ? await PasswordService.verify(user.passwordHash, dto.password)
      : await PasswordService.verifyDummy(dto.password);

    if (!user || !user.passwordHash || !valid) {
      security.log({ event: 'LOGIN_FAILED', ...meta, userId: user?.id });
      throw new UnauthorizedError('Invalid credentials');
    }
    if (user.status !== UserStatus.ACTIVE) {
      security.log({
        event: 'ACCOUNT_UNAVAILABLE_LOGIN_ATTEMPT',
        ...meta,
        userId: user.id,
      });
      throw new UnauthorizedError('Account unavailable');
    }

    const session = await SessionService.createSession({
      userId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
    security.log({
      event: 'LOGIN_SUCCESS',
      ...meta,
      userId: user.id,
      sessionId: session.sessionId,
    });
    return { user: UserService.toSafeUser(user), tokens: session };
  },

  async refresh(payload: ValidatedRefreshToken, meta: RequestMeta) {
    const result = await SessionService.rotateRefreshToken({
      rawToken: payload.rawToken,
      userId: payload.sub,
      sessionId: payload.sessionId,
      jwtId: payload.jwtId,
      requestId: meta.requestId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
    security.log({
      event: 'REFRESH_SUCCESS',
      ...meta,
      userId: payload.sub,
      sessionId: payload.sessionId,
    });
    return result;
  },

  async logout(sessionId: string, meta: RequestMeta) {
    await SessionService.revokeSession(sessionId);
    security.log({ event: 'LOGOUT', ...meta, sessionId });
  },

  async logoutAll(userId: string, meta: RequestMeta) {
    await SessionService.revokeAllSessionsForUser(userId);
    security.log({ event: 'LOGOUT_ALL', ...meta, userId });
  },

  async forgotPassword(emailAddress: string, meta: RequestMeta) {
    const user = await UserService.findByEmail(emailAddress);
    if (!user?.passwordHash) return; // Prevent user enumeration: response will not reveal if user exists

    await AuthRepository.invalidateOpenResetTokens(user.id);
    const { rawToken, hash } = TokenService.generateResetToken();
    const expiresAt = new Date(
      Date.now() + parseDurationSeconds(env.PASSWORD_RESET_EXPIRES_IN) * 1000,
    );
    await AuthRepository.insertResetToken({
      userId: user.id,
      tokenHash: hash,
      expiresAt,
    });

    await EmailService.sendPasswordResetEmail(
      user.email,
      `${env.FRONTEND_URL ?? ''}/reset-password?token=${rawToken}`,
    );
    security.log({
      event: 'PASSWORD_RESET_REQUESTED',
      ...meta,
      userId: user.id,
    });
  },

  async resetPassword(
    rawToken: string,
    newPassword: string,
    meta: RequestMeta,
  ) {
    const token = await AuthRepository.findResetTokenByHash(
      TokenService.hashToken(rawToken),
    );
    if (!token || token.usedAt || token.expiresAt < new Date())
      throw new UnauthorizedError('Invalid or expired reset token');

    const hash = await PasswordService.hash(newPassword);
    await withTransaction(async (tx) => {
      await UserService.updatePassword(token.userId, hash, tx);
      await AuthRepository.markResetTokenUsed(token.id, tx);
    });
    await SessionService.revokeAllSessionsForUser(token.userId);
    security.log({
      event: 'PASSWORD_RESET_SUCCESS',
      ...meta,
      userId: token.userId,
    });
  },

  loginWithGoogle(input: GoogleAuthInput, meta: RequestMeta) {
    return GoogleAuthService.login(input, meta);
  },



};

export type AuthService = typeof AuthService;




