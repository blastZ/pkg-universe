import {
  ConsoleTransportOptions,
  createConsoleTransport,
  createSlsLogTransport,
  logger,
  LoggerLevel,
  SlsLogTransportOptions,
} from '@blastz/logger';
import { deepmerge } from 'deepmerge-ts';

export interface InitLoggerOptions {
  console: {
    enabled: boolean;
    options: ConsoleTransportOptions;
  };
  sls: {
    enabled: boolean;
    options: SlsLogTransportOptions;
  };
}

export function initLogger(opts: Partial<InitLoggerOptions> = {}) {
  const options = deepmerge(
    {
      console: {
        enabled: true,
        options: {
          level: LoggerLevel.Info,
        },
      },
      sls: {
        enabled: false,
      },
    },
    opts
  ) as InitLoggerOptions;

  logger.clear();

  if (options.console.enabled) {
    logger.add(createConsoleTransport(options.console.options));
  }

  if (options.sls.enabled) {
    logger.add(createSlsLogTransport(options.sls.options));
  }
}
