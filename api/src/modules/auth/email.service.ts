import { logger, type Logger } from '../../common/http/logger.js';
import { isProd } from '../../config/env.js';

export interface EmailService {
  sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>;
}

/** Dev only. In production, provide a Resend/SES/SendGrid implementation */
export const EmailService={
  
    async sendPasswordResetEmail(to: string, resetUrl: string) {
      if (isProd)
        throw new Error('ConsoleEmailService must never be used in production');
      logger.debug(`[DEV ONLY] Password reset link for ${to}: ${resetUrl}`);
    },

}
