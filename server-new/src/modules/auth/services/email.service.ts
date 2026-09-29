import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

export interface EmailService {
  sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>;
}

export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');

/**
 * Development-only implementation. Swap this for Resend/SendGrid/SES/Postmark
 * behind the same EMAIL_SERVICE token in auth.module.ts for production — see
 * the factory provider there. It refuses to run at all if NODE_ENV is
 * production, so it can never accidentally ship as the real email path.
 */
@Injectable()
export class ConsoleEmailService implements EmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext('DevEmailService');
  }

  async sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    if (this.configService.get<string>('app.env') === 'production') {
      throw new Error('ConsoleEmailService must never be used in production');
    }
    this.logger.debug(`[DEV ONLY] Password reset link for ${to}: ${resetUrl}`);
  }
}
