import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * Double-submit-cookie CSRF check, applied only to /auth/refresh — the one
 * endpoint that can be triggered using an ambient cookie alone. It no-ops for
 * clients that send the refresh token explicitly in the body (mobile), since
 * those aren't exposed to cookie-based CSRF in the first place.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
    constructor(private readonly configService: ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const cookieName = this.configService.get<string>('auth.cookie.name') as string;

        const usingCookieAuth = Boolean(request.cookies?.[cookieName]) && !request.body?.refreshToken;

        if (!usingCookieAuth) {
            return true;
        }

        const csrfCookie = request.cookies?.['csrf_token'];
        const csrfHeader = request.headers['x-csrf-token'];

        if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
            throw new UnauthorizedException('Invalid or missing CSRF token');
        }

        return true;
    }
}