import { Injectable, UnauthorizedException } from '@nestjs/common';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { PinoLogger } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';
import { DatabaseService } from '../../../database/drizzle/db.service.js';
import * as schema from '../../../database/drizzle/schema.js';
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
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(SessionService.name);
  }

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
    await this.revokeAllSessionsForUser(params.userId);
    const refreshTokenExpiresAt = this.tokenService.getRefreshTokenExpiryDate();
    const sessionRows = await this.db.db
      .insert(schema.session)
      .values({
        id: randomUUID(),
        userId: params.userId,
        deviceId: randomUUID(),
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        expiresAt: refreshTokenExpiresAt,
      })
      .returning();
    const session = sessionRows[0];

    const { token: accessToken } = this.tokenService.generateAccessToken(
      params.userId,
      session.id,
    );
    const { token: refreshToken, jwtId } =
      this.tokenService.generateRefreshToken(params.userId, session.id);

    await this.db.db.insert(schema.refreshToken).values({
      id: randomUUID(),
      sessionId: session.id,
      jwtId,
      tokenHash: this.tokenService.hashToken(refreshToken),
      expiresAt: refreshTokenExpiresAt,
    });

    const ttlSeconds = Math.ceil(
      (refreshTokenExpiresAt.getTime() - Date.now()) / 1000,
    );
    try {
      await this.redis.setActiveSession(params.userId, session.id, ttlSeconds);
    } catch (error) {
      this.logger.error(
        { err: error, userId: params.userId, sessionId: session.id },
        'Failed to cache active session in Redis',
      );
    }

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

    const existingRows = await this.db.db
      .select()
      .from(schema.refreshToken)
      .where(eq(schema.refreshToken.jwtId, jwtId))
      .limit(1);
    const existing = existingRows[0];

    if (!existing || existing.sessionId !== sessionId) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const sessionRows = await this.db.db
      .select()
      .from(schema.session)
      .where(eq(schema.session.id, sessionId))
      .limit(1);
    const session = sessionRows[0];

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
      await this.db.$transaction(async (tx) => {
        const claim = await tx
          .update(schema.refreshToken)
          .set({ revokedAt: new Date() })
          .where(and(eq(schema.refreshToken.id, existing.id), isNull(schema.refreshToken.revokedAt)))
          .returning();

        if (claim.length === 0) {
          throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const created = await tx
          .insert(schema.refreshToken)
          .values({
            id: randomUUID(),
            sessionId,
            jwtId: newJwtId,
            tokenHash: newTokenHash,
            expiresAt: newExpiresAt,
          })
          .returning();

        await tx
          .update(schema.refreshToken)
          .set({ replacedByTokenId: created[0].id })
          .where(eq(schema.refreshToken.id, existing.id));
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
      this.db.db
        .update(schema.session)
        .set({ revokedAt: new Date(), isActive: false })
        .where(and(eq(schema.session.id, sessionId), isNull(schema.session.revokedAt)))
        .returning(),
      this.db.db
        .update(schema.refreshToken)
        .set({ revokedAt: new Date() })
        .where(and(eq(schema.refreshToken.sessionId, sessionId), isNull(schema.refreshToken.revokedAt)))
        .returning(),
    ]);

    await this.cacheRevokedSession(sessionId);
  }

  async revokeAllSessionsForUser(userId: string): Promise<void> {
    const sessions = await this.db.db
      .select({ id: schema.session.id })
      .from(schema.session)
      .where(and(eq(schema.session.userId, userId), isNull(schema.session.revokedAt)));

    const sessionIds = sessions.map((s) => s.id);
    if (sessionIds.length === 0) return;

    await Promise.all([
      this.db.db
        .update(schema.session)
        .set({ revokedAt: new Date(), isActive: false })
        .where(and(eq(schema.session.userId, userId), isNull(schema.session.revokedAt)))
        .returning(),
      this.db.db
        .update(schema.refreshToken)
        .set({ revokedAt: new Date() })
        .where(and(inArray(schema.refreshToken.sessionId, sessionIds), isNull(schema.refreshToken.revokedAt)))
        .returning(),
    ]);

    const ttl = this.tokenService.getAccessTokenTtlSeconds();
    await Promise.all(
      sessions.map(async (session) => {
        try {
          await this.redis.revokeSession(session.id, ttl);
        } catch (error) {
          this.logger.error(
            { err: error, sessionId: session.id },
            'Failed to cache revoked session in Redis',
          );
        }
      }),
    );
  }

  private async cacheRevokedSession(sessionId: string): Promise<void> {
    try {
      await this.redis.revokeSession(
        sessionId,
        this.tokenService.getAccessTokenTtlSeconds(),
      );
    } catch (error) {
      this.logger.error(
        { err: error, sessionId },
        'Failed to cache revoked session in Redis',
      );
    }
  }
}
