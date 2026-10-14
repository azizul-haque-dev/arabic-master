import { logger, type Logger } from '../../common/http/logger.js';
import type { RequestMeta } from './auth.types.js';

export interface SecurityEvent extends Partial<RequestMeta> {
  event: string;
  userId?: string;
  sessionId?: string;
}

const log = logger.child({ context: 'Security' });

export const SecurityLoggerService = {
  log: (event: SecurityEvent) => log.info(event, 'Security event logged'),
};
export type SecurityLoggerService = typeof SecurityLoggerService;

export function createSecurityLogger(_logger: Logger = logger) {
  return SecurityLoggerService;
}

