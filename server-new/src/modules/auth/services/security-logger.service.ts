import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

export type SecurityEventType =
    | 'REGISTER'
    | 'LOGIN_SUCCESS'
    | 'LOGIN_FAILED'
    | 'LOGOUT'
    | 'LOGOUT_ALL'
    | 'REFRESH_SUCCESS'
    | 'REFRESH_TOKEN_REUSE_DETECTED'
    | 'CONCURRENT_REFRESH_RACE_DETECTED'
    | 'PASSWORD_RESET_REQUESTED'
    | 'PASSWORD_RESET_SUCCESS'
    | 'OAUTH_LOGIN'
    | 'ACCOUNT_UNAVAILABLE_LOGIN_ATTEMPT';

export interface SecurityEvent {
    event: SecurityEventType;
    requestId: string;
    userId?: string;
    sessionId?: string;
    ipAddress?: string;
    userAgent?: string;
}

@Injectable()
export class SecurityLoggerService {
    constructor(private readonly logger: PinoLogger) {
        this.logger.setContext(SecurityLoggerService.name);
    }

    /** Only pass identifiers here — never raw passwords, tokens, or secrets. */
    log(event: SecurityEvent): void {
        this.logger.info({ ...event, timestamp: new Date().toISOString() }, event.event);
    }
}