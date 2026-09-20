import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

export type SecurityEventType =
    | 'REGISTER'
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'ACCOUNT_UNAVAILABLE_LOGIN_ATTEMPT'
    | 'REFRESH_SUCCESS'
    | 'REFRESH_TOKEN_REUSE_DETECTED'
    | 'CONCURRENT_REFRESH_RACE_DETECTED'
    | 'LOGOUT'
    | 'LOGOUT_ALL'
    | 'PASSWORD_RESET_REQUESTED'
    | 'PASSWORD_RESET_SUCCESS'
    | 'OAUTH_LOGIN';

export interface SecurityEvent {
    event: SecurityEventType | (string & {});
    requestId: string;
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
}

@Injectable()
export class SecurityLoggerService {
    constructor(private readonly logger: PinoLogger) {
        this.logger.setContext('Security');
    }

    log(event: SecurityEvent): void {
        this.logger.info(event, 'Security event logged');
    }
}









