import type { Logger } from '../../common/http/logger.js';
import type { RequestMeta } from './auth.types.js';

export interface SecurityEvent extends Partial<RequestMeta> {
  event: string;
  userId?: string;
  sessionId?: string;
}

export function createSecurityLogger(logger: Logger) {
  const log = logger.child({ context: 'Security' });
  return { log: (event: SecurityEvent) => log.info(event, 'Security event logged') };
}
export type SecurityLoggerService = ReturnType<typeof createSecurityLogger>;
