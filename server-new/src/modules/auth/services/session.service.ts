import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../../database/drizzle/db.service.js';
import { RedisService } from '../../../database/redis/redis.service.js';
import { SecurityLoggerService } from './security-logger.service.js';
import { TokenService } from './token.service.js';

@Injectable()
export class SessionService {
  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
    private readonly tokenService: TokenService,
    private readonly securityLogger: SecurityLoggerService,
  ) {}

  async createSession(params: {
    userId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{
    sessionId: string;
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
  }> {
    const refreshTokenExpiresAt = this.tokenService.getRefreshTokenExpiryDate();
    const session = await this.db.session.create({
      data: {
        userId: params.userId,
        deviceId: randomUUID(),
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    const { token: accessToken } = this.tokenService.generateAccessToken(
      params.userId,
      session.id,
    );
    const { token: refreshToken, jwtId } =
      this.tokenService.generateRefreshToken(params.userId, session.id);
    await this.db.refreshToken.create({
      data: {
        sessionId: session.id,
        jwtId,
        tokenHash: this.tokenService.hashToken(refreshToken),
        expiresAt: refreshTokenExpiresAt,
      },
    });

    return {
      sessionId: session.id,
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
    };
  }

  async rotateRefreshToken(params: {
    rawToken: string;
    userId: string;
    sessionId: string;
    jwtId: string;
    requestId: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
  }> {
    const { rawToken, userId, sessionId, jwtId, requestId, ipAddress, userAgent } = params;

    const existing = await this.db.refreshToken.findUnique({
      where: { jwtId },
    });

    if (!existing || existing.sessionId !== sessionId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const session = await this.db.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.revokedAt || existing.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const computedHash = this.tokenService.hashToken(rawToken);
    const isReuse = existing.revokedAt !== null || existing.tokenHash !== computedHash;

    if (isReuse) {
      await this.revokeSession(sessionId);
      this.securityLogger.log({
        event: 'REFRESH_TOKEN_REUSE_DETECTED',
        requestId,
        userId,
        sessionId,
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { token: newAccessToken } = this.tokenService.generateAccessToken(userId, sessionId);
    const { token: newRefreshToken, jwtId: newJwtId } =
      this.tokenService.generateRefreshToken(userId, sessionId);
    const newExpiresAt = this.tokenService.getRefreshTokenExpiryDate();
    const newTokenHash = this.tokenService.hashToken(newRefreshToken);

    try {
      await this.db.$transaction(async (tx: DatabaseService) => {
        const claim = await tx.refreshToken.updateMany({
          where: { id: existing.id, revokedAt: null },
          data: { revokedAt: new Date() },
        });

        if (claim.count === 0) {
          throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const created = await tx.refreshToken.create({
          data: {
            sessionId,
            jwtId: newJwtId,
            tokenHash: newTokenHash,
            expiresAt: newExpiresAt,
          },
        });

        await tx.refreshToken.update({
          where: { id: existing.id },
          data: { replacedByTokenId: created.id },
        });
      });
    } catch (error) {
      await this.revokeSession(sessionId);
      this.securityLogger.log({
        event: 'CONCURRENT_REFRESH_RACE_DETECTED',
        requestId,
        userId,
        sessionId,
        ipAddress,
        userAgent,
      });
      throw error;
    }

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      refreshTokenExpiresAt: newExpiresAt,
    };
  }

  async revokeSession(sessionId: string): Promise<void> {
    await Promise.all([
      this.db.session.updateMany({
        where: { id: sessionId, revokedAt: null },
        data: { revokedAt: new Date(), isActive: false },
      }),
      this.db.refreshToken.updateMany({
        where: { sessionId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    await this.redis.revokeSession(
      sessionId,
      this.tokenService.getAccessTokenTtlSeconds(),
    );
  }

  async revokeAllSessionsForUser(userId: string): Promise<void> {
    const sessions = (await this.db.session.findMany({
      where: { userId, revokedAt: null },
      select: { id: true },
    })) as Array<{ id: string }>;

    const sessionIds = sessions.map((s) => s.id);

    await Promise.all([
      this.db.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date(), isActive: false },
      }),
      this.db.refreshToken.updateMany({
        where: { sessionId: { in: sessionIds }, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    const ttl = this.tokenService.getAccessTokenTtlSeconds();
    await Promise.all(
      sessions.map((s: { id: string }) => this.redis.revokeSession(s.id, ttl)),
    );
  }
}
