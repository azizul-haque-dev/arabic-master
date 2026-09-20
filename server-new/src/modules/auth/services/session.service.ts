import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service.js';
import { RedisService } from '../../../database/redis.service.js';
import { SecurityLoggerService } from './security-logger.service.js';
import { TokenService } from './token.service.js';

@Injectable()
export class SessionService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
        private readonly tokenService: TokenService,
        private readonly securityLogger: SecurityLoggerService,
    ) { }

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
        const session = await this.prisma.session.create({
            data: { userId: params.userId, ipAddress: params.ipAddress, userAgent: params.userAgent },
        });

        const { token: accessToken } = this.tokenService.generateAccessToken(params.userId, session.id);
        const { token: refreshToken, jwtId } = this.tokenService.generateRefreshToken(
            params.userId,
            session.id,
        );
        const refreshTokenExpiresAt = this.tokenService.getRefreshTokenExpiryDate();

        await this.prisma.refreshToken.create({
            data: {
                sessionId: session.id,
                jwtId,
                tokenHash: this.tokenService.hashToken(refreshToken),
                expiresAt: refreshTokenExpiresAt,
            },
        });

        return { sessionId: session.id, accessToken, refreshToken, refreshTokenExpiresAt };
    }

    /**
     * Verifies + rotates a refresh token. Race-condition safe: rotation only
     * succeeds if this exact token row is still unrevoked at the moment of the
     * DB update. Reuse of an already-rotated token revokes the whole session.
     */
    async rotateRefreshToken(params: {
        rawToken: string;
        userId: string;
        sessionId: string;
        jwtId: string;
        requestId: string;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{ accessToken: string; refreshToken: string; refreshTokenExpiresAt: Date }> {
        const { rawToken, userId, sessionId, jwtId, requestId, ipAddress, userAgent } = params;

        const existing = await this.prisma.refreshToken.findUnique({ where: { jwtId } });

        if (!existing || existing.sessionId !== sessionId) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const session = await this.prisma.session.findUnique({ where: { id: sessionId } });

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
        const { token: newRefreshToken, jwtId: newJwtId } = this.tokenService.generateRefreshToken(
            userId,
            sessionId,
        );
        const newExpiresAt = this.tokenService.getRefreshTokenExpiryDate();
        const newTokenHash = this.tokenService.hashToken(newRefreshToken);

        try {
            await this.prisma.$transaction(async (tx) => {
                // Compare-and-swap: only the first request to reach this update wins.
                // A concurrent duplicate request gets count === 0 and aborts.
                const claim = await tx.refreshToken.updateMany({
                    where: { id: existing.id, revokedAt: null },
                    data: { revokedAt: new Date() },
                });

                if (claim.count === 0) {
                    throw new UnauthorizedException('Invalid or expired refresh token');
                }

                const created = await tx.refreshToken.create({
                    data: { sessionId, jwtId: newJwtId, tokenHash: newTokenHash, expiresAt: newExpiresAt },
                });

                await tx.refreshToken.update({
                    where: { id: existing.id },
                    data: { replacedByTokenId: created.id },
                });
            });
        } catch (error) {
            // Lost the compare-and-swap race: two requests tried to use the same
            // refresh token at once. Only one should ever legitimately do that.
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
        await this.prisma.$transaction([
            this.prisma.session.update({ where: { id: sessionId }, data: { revokedAt: new Date() } }),
            this.prisma.refreshToken.updateMany({
                where: { sessionId, revokedAt: null },
                data: { revokedAt: new Date() },
            }),
        ]);

        // Access tokens are stateless JWTs — this is what actually blocks
        // already-issued ones for the remainder of their (short) natural lifetime.
        await this.redis.revokeSession(sessionId, this.tokenService.getAccessTokenTtlSeconds());
    }

    async revokeAllSessionsForUser(userId: string): Promise<void> {
        const sessions = await this.prisma.session.findMany({
            where: { userId, revokedAt: null },
            select: { id: true },
        });

        await this.prisma.$transaction([
            this.prisma.session.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            }),
            this.prisma.refreshToken.updateMany({
                where: { session: { userId }, revokedAt: null },
                data: { revokedAt: new Date() },
            }),
        ]);

        const ttl = this.tokenService.getAccessTokenTtlSeconds();
        await Promise.all(sessions.map((s) => this.redis.revokeSession(s.id, ttl)));
    }
}