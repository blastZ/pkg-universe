import {
  ConsoleTransportOptions,
  createConsoleTransport,
  createFileTransport,
  createSlsLogTransport,
  FileTransportOptions,
  logger,
  LoggerLevel,
  SlsLogTransportOptions,
} from '@blastz/logger';
import { deepmerge } from 'deepmerge-ts';

export interface InitLoggerOptions {
  console?: {
    enabled?: boolean;
    options?: Partial<ConsoleTransportOptions>;
  };
  file?: {
    enabled?: boolean;
    options?: Partial<FileTransportOptions>;
  };
  sls?: {
    enabled?: boolean;
    options?: Partial<SlsLogTransportOptions>;
  };
}

export function initLogger(opts: InitLoggerOptions = {}) {
  const options = deepmerge(
    {
      console: {
        enabled: true,
        options: {
          level: LoggerLevel.Info,
        },
      },
      file: {
        enabled: false,
        options: {
          level: LoggerLevel.Trace,
        },
      },
      sls: {
        enabled: false,
        options: {
          level: LoggerLevel.Trace,
          endpoint: '',
          accessKeyId: '',
          secretAccessKey: '',
          apiVersion: '2015-06-01',
          projectName: '',
          logStoreName: '',
          source: '',
        },
      },
    },
    opts
  ) as InitLoggerOptions;

  logger.clear();

  if (options.console?.enabled) {
    logger.add(createConsoleTransport(options.console.options));
  }

  if (options.file?.enabled) {
    logger.add(createFileTransport(options.file.options));
  }

  if (options.sls?.enabled) {
    logger.add(
      createSlsLogTransport(options.sls.options as SlsLogTransportOptions)
    );
  }
}
