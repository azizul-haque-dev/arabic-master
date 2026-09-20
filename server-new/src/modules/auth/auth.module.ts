import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module.js';

import { AccessTokenGuard } from './guards/access-token.guard.js';
import { CsrfGuard } from './guards/csrf.guard.js';
import { RefreshTokenGuard } from './guards/refresh-token.guard.js';
import { ConsoleEmailService, EMAIL_SERVICE } from './services/email.service.js';
import { OAuthService } from './services/oauth.service.js';
import { PasswordService } from './services/password.service.js';
import { SecurityLoggerService } from './services/security-logger.service.js';
import { SessionService } from './services/session.service.js';
import { TokenService } from './services/token.service.js';
import { AccessTokenStrategy } from './strategies/access-token.strategy.js';
import { GoogleStrategy } from './strategies/google.strategy.js';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
    imports: [PassportModule.register({ session: false }), UsersModule],
    controllers: [AuthController],
    providers: [
        AuthService,
        PasswordService,
        TokenService,
        SessionService,
        OAuthService,
        SecurityLoggerService,
        AccessTokenStrategy,
        RefreshTokenStrategy,
        GoogleStrategy,
        AccessTokenGuard,
        RefreshTokenGuard,
        CsrfGuard,
        {
            provide: EMAIL_SERVICE,
            useFactory: (configService: ConfigService) => new ConsoleEmailService(configService),
            inject: [ConfigService],
            // Swap the factory body for a real provider (Resend/SendGrid/SES/Postmark)
            // behind this same EMAIL_SERVICE token when going to production.
        },
    ],
})
export class AuthModule { }