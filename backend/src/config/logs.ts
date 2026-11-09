import pino from 'pino';
import { secrets } from './secrets';

// Único punto de emisión de logs (regla 7 de AGENT.md).
// Nunca instantiar pino fuera de este archivo.
export const logger = pino({
  level: secrets.LOG_LEVEL,
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
});

export function childLogger(component: string): pino.Logger {
  return logger.child({ component });
}
