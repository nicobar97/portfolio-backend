import { Configuration } from '../../core/port/Configuration';
import { Logger } from '../../core/port/Logger';

const shouldLog = (configuration: Configuration, environments: string[]): boolean => {
  return environments.includes(configuration.server.environment);
};

const logMethodFactory =
  (configuration: Configuration, environments: string[], logFn: (msg: string, obj?: unknown) => void) =>
  (msg: string, obj?: unknown): void => {
    if (shouldLog(configuration, environments)) {
      obj ? logFn(msg, obj) : logFn(msg);
    }
  };

export const consoleLogger = (configuration: Configuration): Logger => ({
  debug: logMethodFactory(configuration, ['development'], console.debug),
  info: logMethodFactory(configuration, ['development', 'production', 'local', 'test'], console.info),
  warn: logMethodFactory(configuration, ['development', 'local', 'test'], console.warn),
  error: logMethodFactory(configuration, ['development', 'production', 'local', 'test'], console.error),
});
