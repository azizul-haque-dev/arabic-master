import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Ip,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';
import { REQUEST_ID_HEADER } from '../../common/middleware/request-id.middleware.js';
import { UsersService } from '../users/users.service.js';

import { CurrentUser } from './decorators/current-user.decorator.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';
import { AccessTokenGuard } from './guards/access-token.guard.js';
import { CsrfGuard } from './guards/csrf.guard.js';
import { RefreshTokenGuard } from './guards/refresh-token.guard.js';
import type { GoogleProfilePayload } from './services/oauth.service.js';
import type { ValidatedRefreshToken } from './strategies/refresh-token.strategy.js';
import type { RequestUser } from './types/jwt-payload.type.js';
import { AuthService } from './auth.service.js';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
    ) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @ApiOperation({ summary: 'Create a new account with email + password' })
    async register(
        @Body() dto: RegisterDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Ip() ip: string,
    ) {
        const result = await this.authService.register(dto, this.meta(req, ip));
        const isNonCookie = this.isNonCookieClient(req);

        if (!isNonCookie) {
            this.setAuthCookies(res, result.tokens.refreshToken, result.tokens.refreshTokenExpiresAt);
            return {
                user: result.user,
                accessToken: result.tokens.accessToken,
            };
        }

        return {
            user: result.user,
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
        };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @ApiOperation({ summary: 'Authenticate with email + password' })
    async login(
        @Body() dto: LoginDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Ip() ip: string,
    ) {
        const result = await this.authService.login(dto, this.meta(req, ip));
        const isNonCookie = this.isNonCookieClient(req);

        if (!isNonCookie) {
            this.setAuthCookies(res, result.tokens.refreshToken, result.tokens.refreshTokenExpiresAt);
            return {
                user: result.user,
                accessToken: result.tokens.accessToken,
            };
        }

        return {
            user: result.user,
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
        };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    @UseGuards(CsrfGuard, RefreshTokenGuard)
    @ApiBody({ type: RefreshTokenDto })
    @ApiOperation({ summary: 'Rotate a refresh token for a new token pair' })
    async refresh(
        @CurrentUser() refreshTokenPayload: ValidatedRefreshToken,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Ip() ip: string,
    ) {
        const result = await this.authService.refresh(refreshTokenPayload, this.meta(req, ip));
        const isNonCookie = this.isNonCookieClient(req);

        if (!isNonCookie) {
            this.setAuthCookies(res, result.refreshToken, result.refreshTokenExpiresAt);
            return { accessToken: result.accessToken };
        }

        return { accessToken: result.accessToken, refreshToken: result.refreshToken };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AccessTokenGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Revoke the current session only' })
    async logout(
        @CurrentUser() user: RequestUser,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Ip() ip: string,
    ) {
        await this.authService.logout(user.sessionId, this.meta(req, ip));
        if (!this.isNonCookieClient(req)) {
            this.clearAuthCookies(res);
        }
        return { message: 'Logged out' };
    }

    @Post('logout-all')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AccessTokenGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Revoke every session for the current user' })
    async logoutAll(
        @CurrentUser() user: RequestUser,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
        @Ip() ip: string,
    ) {
        await this.authService.logoutAll(user.userId, this.meta(req, ip));
        if (!this.isNonCookieClient(req)) {
            this.clearAuthCookies(res);
        }
        return { message: 'Logged out of all sessions' };
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 60000 } })
    @ApiOperation({ summary: 'Request a password reset email' })
    async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request, @Ip() ip: string) {
        await this.authService.forgotPassword(dto.email, this.meta(req, ip));
        return { message: 'If the account exists, password reset instructions have been sent.' };
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @ApiOperation({ summary: 'Reset password using a token from the reset email' })
    async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request, @Ip() ip: string) {
        await this.authService.resetPassword(dto.token, dto.newPassword, this.meta(req, ip));
        return { message: 'Password has been reset. Please log in again.' };
    }

    @Get('me')
    @UseGuards(AccessTokenGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get the currently authenticated user' })
    async me(@CurrentUser() user: RequestUser) {
        const dbUser = await this.usersService.findById(user.userId);
        return dbUser ? this.usersService.toSafeUser(dbUser) : null;
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Start Google OAuth login' })
    googleAuth(): void {
        // Passport redirects to Google before this body ever runs.
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Google OAuth callback' })
    async googleCallback(
        @Req() req: Request & { user: GoogleProfilePayload },
        @Res() res: Response,
        @Ip() ip: string,
    ) {
        const result = await this.authService.loginWithGoogle(req.user, this.meta(req, ip));
        this.setAuthCookies(res, result.tokens.refreshToken, result.tokens.refreshTokenExpiresAt);

        const frontendUrl = this.configService.get<string>('auth.frontendUrl');
        if (frontendUrl) {
            return res.redirect(`${frontendUrl}/oauth/callback?accessToken=${result.tokens.accessToken}`);
        }

        return res.json({
            user: result.user,
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
        });
    }

    private meta(req: Request, ip: string) {
        return {
            requestId: (req.headers[REQUEST_ID_HEADER] as string) ?? 'unknown',
            ipAddress: ip,
            userAgent: req.headers['user-agent'],
        };
    }

    private isNonCookieClient(req: Request): boolean {
        return Boolean(req.headers['x-client-type']);
    }

    private cookiePath(): string {
        const apiPrefix = this.configService.get<string>('app.apiPrefix') ?? 'api';
        // Matches the URI-versioning default configured in main.ts (defaultVersion: '1').
        return `/${apiPrefix}/v1/auth`;
    }

    private setAuthCookies(res: Response, refreshToken: string, expiresAt: Date): void {
        const cookie = this.configService.get('auth.cookie') as {
            name: string;
            secure: boolean;
            httpOnly: boolean;
            sameSite: 'lax' | 'strict' | 'none';
        };
        const path = this.cookiePath();

        res.cookie(cookie.name, refreshToken, {
            httpOnly: cookie.httpOnly,
            secure: cookie.secure,
            sameSite: cookie.sameSite,
            expires: expiresAt,
            path,
        });

        // Readable by JS on purpose — double-submit CSRF token, not a secret.
        res.cookie('csrf_token', randomUUID(), {
            httpOnly: false,
            secure: cookie.secure,
            sameSite: cookie.sameSite,
            expires: expiresAt,
            path,
        });
    }

    private clearAuthCookies(res: Response): void {
        const cookie = this.configService.get('auth.cookie') as { name: string };
        const path = this.cookiePath();
        res.clearCookie(cookie.name, { path });
        res.clearCookie('csrf_token', { path });
    }
}