import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { CsrfGuard } from './guards/csrf.guard.js';
import { RefreshTokenGuard } from './guards/refresh-token.guard.js';
import { AccessTokenGuard } from './guards/access-token.guard.js';
import { Request, Response } from 'express';

describe('AuthController & Web/Mobile Auth Flow', () => {
    let controller: AuthController;
    let authService: Partial<Record<keyof AuthService, any>>;
    let configService: Partial<Record<keyof ConfigService, any>>;
    let mockResponse: Partial<Response>;

    const mockUser = { id: 'u-1', email: 'test@example.com', fullName: 'Test User' };
    const mockTokens = {
        accessToken: 'access-token-xyz',
        refreshToken: 'refresh-token-123',
        refreshTokenExpiresAt: new Date(Date.now() + 86400000),
    };

    beforeEach(async () => {
        authService = {
            register: vi.fn().mockResolvedValue({ user: mockUser, tokens: mockTokens }),
            login: vi.fn().mockResolvedValue({ user: mockUser, tokens: mockTokens }),
            refresh: vi.fn().mockResolvedValue({
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
                refreshTokenExpiresAt: mockTokens.refreshTokenExpiresAt,
            }),
            logout: vi.fn().mockResolvedValue(undefined),
            logoutAll: vi.fn().mockResolvedValue(undefined),
        };

        configService = {
            get: vi.fn().mockImplementation((key: string) => {
                if (key === 'app.apiPrefix') return 'api';
                if (key === 'auth.cookie') return { name: 'refresh_token', secure: false, httpOnly: true, sameSite: 'lax' };
                if (key === 'auth.cookie.name') return 'refresh_token';
                if (key === 'auth.jwt.refreshSecret') return 'test-secret';
                return null;
            }),
        };

        mockResponse = {
            cookie: vi.fn(),
            clearCookie: vi.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            imports: [PassportModule],
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useValue: authService },
                { provide: UsersService, useValue: {} },
                { provide: ConfigService, useValue: configService },
            ],
        })
            .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
            .overrideGuard(RefreshTokenGuard).useValue({ canActivate: () => true })
            .overrideGuard(AccessTokenGuard).useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AuthController>(AuthController);
    });

    describe('Register Flow', () => {
        it('Web register: sets cookies and does NOT return refreshToken in body', async () => {
            const req = { headers: {} } as unknown as Request;
            const res = mockResponse as Response;

            const response = await controller.register(
                { email: 'test@example.com', password: 'password123', fullName: 'Test User' },
                req,
                res,
                '127.0.0.1',
            );

            expect(mockResponse.cookie).toHaveBeenCalledWith('refresh_token', 'refresh-token-123', expect.any(Object));
            expect(mockResponse.cookie).toHaveBeenCalledWith('csrf_token', expect.any(String), expect.any(Object));
            expect(response).toEqual({
                user: mockUser,
                accessToken: 'access-token-xyz',
            });
            expect(response).not.toHaveProperty('refreshToken');
        });

        it('Mobile register: returns refreshToken in JSON body and does NOT set cookies', async () => {
            const req = { headers: { 'x-client-type': 'mobile' } } as unknown as Request;
            const res = mockResponse as Response;

            const response = await controller.register(
                { email: 'test@example.com', password: 'password123', fullName: 'Test User' },
                req,
                res,
                '127.0.0.1',
            );

            expect(mockResponse.cookie).not.toHaveBeenCalled();
            expect(response).toEqual({
                user: mockUser,
                accessToken: 'access-token-xyz',
                refreshToken: 'refresh-token-123',
            });
        });
    });

    describe('Login Flow', () => {
        it('Web login: sets cookies and excludes refreshToken from body', async () => {
            const req = { headers: {} } as unknown as Request;
            const res = mockResponse as Response;

            const response = await controller.login(
                { email: 'test@example.com', password: 'password123' },
                req,
                res,
                '127.0.0.1',
            );

            expect(mockResponse.cookie).toHaveBeenCalled();
            expect(response).toEqual({
                user: mockUser,
                accessToken: 'access-token-xyz',
            });
            expect(response).not.toHaveProperty('refreshToken');
        });

        it('Mobile login: returns refreshToken in body and skips cookies', async () => {
            const req = { headers: { 'x-client-type': 'mobile' } } as unknown as Request;
            const res = mockResponse as Response;

            const response = await controller.login(
                { email: 'test@example.com', password: 'password123' },
                req,
                res,
                '127.0.0.1',
            );

            expect(mockResponse.cookie).not.toHaveBeenCalled();
            expect(response).toEqual({
                user: mockUser,
                accessToken: 'access-token-xyz',
                refreshToken: 'refresh-token-123',
            });
        });
    });

    describe('Refresh Flow', () => {
        const payload = {
            sub: 'u-1',
            type: 'refresh' as const,
            sessionId: 's-1',
            jwtId: 'jti-1',
            rawToken: 'refresh-token-123',
        };

        it('Web refresh: sets rotated refresh cookie and returns only accessToken', async () => {
            const req = { headers: {} } as unknown as Request;
            const res = mockResponse as Response;

            const response = await controller.refresh(payload, req, res, '127.0.0.1');

            expect(mockResponse.cookie).toHaveBeenCalledWith('refresh_token', 'new-refresh-token', expect.any(Object));
            expect(response).toEqual({ accessToken: 'new-access-token' });
            expect(response).not.toHaveProperty('refreshToken');
        });

        it('Mobile refresh: returns new accessToken and new refreshToken, skips cookies', async () => {
            const req = { headers: { 'x-client-type': 'mobile' } } as unknown as Request;
            const res = mockResponse as Response;

            const response = await controller.refresh(payload, req, res, '127.0.0.1');

            expect(mockResponse.cookie).not.toHaveBeenCalled();
            expect(response).toEqual({
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
            });
        });
    });

    describe('Logout Flow', () => {
        it('Web logout: clears cookies and revokes session', async () => {
            const req = { headers: {} } as unknown as Request;
            const res = mockResponse as Response;

            const response = await controller.logout(
                { userId: 'u-1', sessionId: 's-1', jwtId: 'jti-1' },
                req,
                res,
                '127.0.0.1',
            );

            expect(authService.logout).toHaveBeenCalledWith('s-1', expect.any(Object));
            expect(mockResponse.clearCookie).toHaveBeenCalledWith('refresh_token', expect.any(Object));
            expect(mockResponse.clearCookie).toHaveBeenCalledWith('csrf_token', expect.any(Object));
            expect(response).toEqual({ message: 'Logged out' });
        });

        it('Mobile logout: revokes session without attempting clearCookie', async () => {
            const req = { headers: { 'x-client-type': 'mobile' } } as unknown as Request;
            const res = mockResponse as Response;

            const response = await controller.logout(
                { userId: 'u-1', sessionId: 's-1', jwtId: 'jti-1' },
                req,
                res,
                '127.0.0.1',
            );

            expect(authService.logout).toHaveBeenCalledWith('s-1', expect.any(Object));
            expect(mockResponse.clearCookie).not.toHaveBeenCalled();
            expect(response).toEqual({ message: 'Logged out' });
        });
    });

    describe('CsrfGuard', () => {
        let csrfGuard: CsrfGuard;

        beforeEach(() => {
            csrfGuard = new CsrfGuard(configService as ConfigService);
        });

        it('bypasses CSRF check for Mobile requests', () => {
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        headers: { 'x-client-type': 'mobile' },
                    }),
                }),
            } as ExecutionContext;

            expect(csrfGuard.canActivate(mockContext)).toBe(true);
        });

        it('passes CSRF check for Web requests when csrf_token cookie equals x-csrf-token header', () => {
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        headers: { 'x-csrf-token': 'csrf-123' },
                        cookies: { refresh_token: 'token', csrf_token: 'csrf-123' },
                    }),
                }),
            } as ExecutionContext;

            expect(csrfGuard.canActivate(mockContext)).toBe(true);
        });

        it('throws UnauthorizedException for Web requests when CSRF token is missing or mismatched', () => {
            const mockContext = {
                switchToHttp: () => ({
                    getRequest: () => ({
                        headers: { 'x-csrf-token': 'wrong-csrf' },
                        cookies: { refresh_token: 'token', csrf_token: 'csrf-123' },
                    }),
                }),
            } as ExecutionContext;

            expect(() => csrfGuard.canActivate(mockContext)).toThrow(UnauthorizedException);
        });
    });
});
