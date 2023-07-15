import { FastifyBaseLogger } from 'fastify';
import { Logger } from '../../core/port/Logger';

export const fastifyLogger = (logger: FastifyBaseLogger): Logger => ({
  debug: (msg: string, obj?: unknown) => logger.debug(msg, obj),
  info: (msg: string, obj?: unknown) => logger.info(msg, obj),
  warn: (msg: string, obj?: unknown) => logger.warn(msg, obj),
  error: (msg: string, obj?: unknown) => logger.error(msg, obj),
});
