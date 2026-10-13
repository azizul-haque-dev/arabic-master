import type { Logger } from '../../common/http/logger.js';
import { isProd } from '../../config/env.js';

export interface EmailService {
  sendPasswordResetEmail(to: string, resetUrl: string): Promise<void>;
}

/** শুধু dev-এর জন্য। prod-এ Resend/SES/SendGrid implementation দিন */
export function createConsoleEmailService(logger: Logger): EmailService {
  return {
    async sendPasswordResetEmail(to, resetUrl) {
      if (isProd) throw new Error('ConsoleEmailService must never be used in production');
      logger.debug(`[DEV ONLY] Password reset link for ${to}: ${resetUrl}`);
    },
  };
}
