import { Injectable } from '@nestjs/common';
import type { StringValue } from 'ms';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHmac, randomUUID } from 'crypto';
import { AccessTokenPayload, RefreshTokenPayload } from '../types/jwt-payload.type.js';

@Injectable()
export class TokenService {
    private readonly accessJwt: JwtService;
    private readonly refreshJwt: JwtService;
    private readonly tokenHashSecret: string;

    constructor(private readonly configService: ConfigService) {
        // Two independent JwtService instances, each with its own secret — never
        // share a secret between access and refresh tokens.
        this.accessJwt = new JwtService({
            secret: this.configService.get<string>('auth.jwt.accessSecret'),
            signOptions: { expiresIn: this.configService.get<string>('auth.jwt.accessExpiresIn') as StringValue },
        });

        this.refreshJwt = new JwtService({
            secret: this.configService.get<string>('auth.jwt.refreshSecret'),
            signOptions: { expiresIn: this.configService.get<string>('auth.jwt.refreshExpiresIn') as StringValue },
        });

        this.tokenHashSecret = this.configService.get<string>('auth.tokenHashSecret') as string;
    }

    generateAccessToken(userId: string, sessionId: string): { token: string; jti: string } {
        const jti = randomUUID();
        const payload: AccessTokenPayload = { sub: userId, type: 'access', sid: sessionId, jti };
        return { token: this.accessJwt.sign(payload), jti };
    }

    generateRefreshToken(userId: string, sessionId: string): { token: string; jti: string } {
        const jti = randomUUID();
        const payload: RefreshTokenPayload = { sub: userId, type: 'refresh', sid: sessionId, jti };
        return { token: this.refreshJwt.sign(payload), jti };
    }

    verifyAccessToken(token: string): AccessTokenPayload {
        return this.accessJwt.verify<AccessTokenPayload>(token);
    }

    verifyRefreshToken(token: string): RefreshTokenPayload {
        return this.refreshJwt.verify<RefreshTokenPayload>(token);
    }

    getAccessTokenTtlSeconds(): number {
        return this.parseDurationToSeconds(
            this.configService.get<string>('auth.jwt.accessExpiresIn') as string,
        );
    }

    getRefreshTokenExpiryDate(): Date {
        const seconds = this.parseDurationToSeconds(
            this.configService.get<string>('auth.jwt.refreshExpiresIn') as string,
        );
        return new Date(Date.now() + seconds * 1000);
    }

    /** Deterministic HMAC fingerprint — lets us store/compare tokens without keeping raw values. */
    hashToken(rawToken: string): string {
        return createHmac('sha256', this.tokenHashSecret).update(rawToken).digest('hex');
    }

    generateResetToken(): { rawToken: string; hash: string } {
        const rawToken = randomUUID() + randomUUID();
        return { rawToken, hash: this.hashToken(rawToken) };
    }

    private parseDurationToSeconds(duration: string): number {
        const match = /^(\d+)(s|m|h|d)$/.exec(duration);
        if (!match) return 0;
        const value = parseInt(match[1], 10);
        const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
        return value * multipliers[match[2]];
    }
}