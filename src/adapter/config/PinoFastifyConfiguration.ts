import { FastifyRequest, FastifyReply, FastifyError } from 'fastify';
import { Configuration } from '../../core/port/Configuration';

export const getLoggerConfigs = (configuration: Configuration) => {
  switch (configuration.server.environment) {
    case 'development':
      return {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        serializers: {
          req(request: FastifyRequest) {
            return {
              method: request.method,
              url: request.url,
              headers: request.headers,
              hostname: request.hostname,
              remoteAddress: request.ip,
              remotePort: request.socket.remotePort,
            };
          },
          res(response: FastifyReply) {
            return {
              code: response.code,
            };
          },
          err(error: FastifyError) {
            return {
              type: error.name,
              message: error.message,
              code: error.code,
              stack: error.stack,
            };
          },
        },
        level: 'debug',
      };
    case 'production':
      return {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
        redact: ['req.headers.authorization'],
        level: 'debug',
        disableRequestLogging: true,
      };
    case 'local':
      return {
        transport: {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
        level: 'trace',
      };
    case 'test':
      return false;
    default:
      return true;
  }
};
