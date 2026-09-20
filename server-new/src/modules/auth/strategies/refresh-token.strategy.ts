import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RefreshTokenPayload } from '../types/jwt-payload.type.js';

function extractRefreshToken(configService: ConfigService) {
    return (req: Request): string | null => {
        const isNonCookieClient = Boolean(req.headers['x-client-type']);
        if (isNonCookieClient) {
            return req.body?.refreshToken ?? null;
        }

        const cookieName = configService.get<string>('auth.cookie.name') as string;
        return req.cookies?.[cookieName] ?? null;
    };
}

export interface ValidatedRefreshToken extends RefreshTokenPayload {
    rawToken: string;
}

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(private readonly configService: ConfigService) {
        super({
            jwtFromRequest: extractRefreshToken(configService),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('auth.jwt.refreshSecret') as string,
            passReqToCallback: true,
        });
    }

    validate(req: Request, payload: RefreshTokenPayload): ValidatedRefreshToken {
        if (payload.type !== 'refresh') {
            throw new UnauthorizedException('Invalid token type');
        }

        const isNonCookieClient = Boolean(req.headers['x-client-type']);
        const cookieName = this.configService.get<string>('auth.cookie.name') as string;
        const rawToken = isNonCookieClient ? req.body?.refreshToken : req.cookies?.[cookieName];

        if (!rawToken) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        return { ...payload, rawToken };
    }
}