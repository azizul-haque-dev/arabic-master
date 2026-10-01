import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/drizzle/db.service.js';
import { UserStatus } from '../../database/drizzle/enums.js';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import type { EmailService } from './services/email.service.js';
import { EMAIL_SERVICE } from './services/email.service.js';
import {
  GoogleProfilePayload,
  OAuthService,
} from './services/oauth.service.js';
import { PasswordService } from './services/password.service.js';
import { SecurityLoggerService } from './services/security-logger.service.js';
import { SessionService } from './services/session.service.js';
import { TokenService } from './services/token.service.js';
import { ValidatedRefreshToken } from './strategies/refresh-token.strategy.js';
import { AuthResult } from './types/auth-result.type.js';

interface RequestMeta {
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly oauthService: OAuthService,
    private readonly securityLogger: SecurityLoggerService,
    private readonly configService: ConfigService,
    @Inject(EMAIL_SERVICE) private readonly emailService: EmailService,
  ) {}

  async register(dto: RegisterDto, meta: RequestMeta): Promise<AuthResult> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await this.passwordService.hash(dto.password);

    const user = await this.db.$transaction((tx: DatabaseService) =>
      this.usersService.createWithPassword(
        { email: dto.email, passwordHash, fullName: dto.fullName },
        tx,
      ),
    );

    const session = await this.sessionService.createSession({
      userId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    this.securityLogger.log({
      event: 'REGISTER',
      requestId: meta.requestId,
      userId: user.id,
      sessionId: session.sessionId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return { user: this.usersService.toSafeUser(user), tokens: session };
  }

  async login(dto: LoginDto, meta: RequestMeta): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(dto.email);

    const passwordValid = user?.passwordHash
      ? await this.passwordService.verify(user.passwordHash, dto.password)
      : await this.passwordService.verifyDummy(dto.password);

    if (!user || !user.passwordHash || !passwordValid) {
      this.securityLogger.log({
        event: 'LOGIN_FAILED',
        requestId: meta.requestId,
        userId: user?.id,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      this.securityLogger.log({
        event: 'ACCOUNT_UNAVAILABLE_LOGIN_ATTEMPT',
        requestId: meta.requestId,
        userId: user.id,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
      throw new UnauthorizedException('Account unavailable');
    }

    const session = await this.sessionService.createSession({
      userId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    this.securityLogger.log({
      event: 'LOGIN_SUCCESS',
      requestId: meta.requestId,
      userId: user.id,
      sessionId: session.sessionId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return { user: this.usersService.toSafeUser(user), tokens: session };
  }

  async refresh(refreshTokenPayload: ValidatedRefreshToken, meta: RequestMeta) {
    const result = await this.sessionService.rotateRefreshToken({
      rawToken: refreshTokenPayload.rawToken,
      userId: refreshTokenPayload.sub,
      sessionId: refreshTokenPayload.sessionId,
      jwtId: refreshTokenPayload.jwtId,
      requestId: meta.requestId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    this.securityLogger.log({
      event: 'REFRESH_SUCCESS',
      requestId: meta.requestId,
      userId: refreshTokenPayload.sub,
      sessionId: refreshTokenPayload.sessionId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return result;
  }

  async logout(sessionId: string, meta: RequestMeta): Promise<void> {
    await this.sessionService.revokeSession(sessionId);
    this.securityLogger.log({
      event: 'LOGOUT',
      requestId: meta.requestId,
      sessionId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
  }

  async logoutAll(userId: string, meta: RequestMeta): Promise<void> {
    await this.sessionService.revokeAllSessionsForUser(userId);
    this.securityLogger.log({
      event: 'LOGOUT_ALL',
      requestId: meta.requestId,
      userId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
  }

  async forgotPassword(email: string, meta: RequestMeta): Promise<void> {
    const user = await this.usersService.findByEmail(email);

    if (user && user.passwordHash) {
      await this.db.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      const { rawToken, hash } = this.tokenService.generateResetToken();
      const expiresAt = new Date(
        Date.now() +
          this.parseDurationMs(
            this.configService.get<string>('auth.passwordResetExpiresIn') as string,
          ),
      );

      await this.db.passwordResetToken.create({
        data: { userId: user.id, tokenHash: hash, expiresAt },
      });

      const frontendUrl = this.configService.get<string>('auth.frontendUrl') ?? '';
      const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;
      await this.emailService.sendPasswordResetEmail(user.email, resetUrl);

      this.securityLogger.log({
        event: 'PASSWORD_RESET_REQUESTED',
        requestId: meta.requestId,
        userId: user.id,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }
  }

  async resetPassword(
    rawToken: string,
    newPassword: string,
    meta: RequestMeta,
  ): Promise<void> {
    const tokenHash = this.tokenService.hashToken(rawToken);
    const resetToken = await this.db.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const newPasswordHash = await this.passwordService.hash(newPassword);

    await this.db.$transaction(async (tx: DatabaseService) => {
      await tx.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: newPasswordHash },
      });
      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      });
    });

    await this.sessionService.revokeAllSessionsForUser(resetToken.userId);

    this.securityLogger.log({
      event: 'PASSWORD_RESET_SUCCESS',
      requestId: meta.requestId,
      userId: resetToken.userId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });
  }

  async loginWithGoogle(
    profile: GoogleProfilePayload,
    meta: RequestMeta,
  ): Promise<AuthResult> {
    const user = await this.oauthService.findOrCreateGoogleUser(profile);

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account unavailable');
    }

    const session = await this.sessionService.createSession({
      userId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    this.securityLogger.log({
      event: 'OAUTH_LOGIN',
      requestId: meta.requestId,
      userId: user.id,
      sessionId: session.sessionId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return { user: this.usersService.toSafeUser(user), tokens: session };
  }

  private parseDurationMs(duration: string): number {
    const match = /^(\d+)(s|m|h|d)$/.exec(duration);
    if (!match) return 0;
    const value = parseInt(match[1], 10);
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000,
    };
    return value * multipliers[match[2]];
  }
}
