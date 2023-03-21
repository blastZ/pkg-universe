import dotenv from 'dotenv';

dotenv.config({
  path: resolve(process.cwd(), './packages/logger/.env'),
});

import { AsyncLocalStorage } from 'async_hooks';

import { resolve } from 'path';
import {
  createConsoleTransport,
  createFileTransport,
  createSlsLogTransport,
  logger,
  LoggerLevel,
} from '../src/index.js';

describe('logger', () => {
  it('should work with console transport', () => {
    logger.clear().add(createConsoleTransport({ level: LoggerLevel.Trace }));

    logger.fatal('fatal');
    logger.error('error');
    logger.warn('warn');
    logger.info('info');
    logger.debug('debug');
    logger.trace('trace');
  });

  it('should work with file transport', () => {
    logger
      .clear()
      .add(createFileTransport({ level: LoggerLevel.Trace }))
      .add(createFileTransport({ level: LoggerLevel.Error }));

    logger.fatal('fatal');
    logger.error('error');
    logger.warn('warn');
    logger.info('info');
    logger.debug('debug');
    logger.trace('trace');
  });

  it('should work with file transport (disable json output)', () => {
    logger
      .clear()
      .add(
        createFileTransport({ level: LoggerLevel.Trace, jsonOutput: false })
      );

    logger.error('error');
  });

  it('should work with child logger', () => {
    logger.clear().add(createConsoleTransport());

    logger.child({ stage: 'test' }).trace('test');
  });

  it('should work with context', () => {
    const context = new AsyncLocalStorage<Record<string, unknown>>();

    logger.context = context;

    context.run({ requestId: 'xxx' }, () => {
      logger.info('test context');
    });
  });

  it('should work with sls log transport', () => {
    logger
      .clear()
      .add(createConsoleTransport({ level: LoggerLevel.Trace }))
      .add(
        createSlsLogTransport({
          level: LoggerLevel.Trace,
          endpoint: process.env.SLS_LOG_ENDPOINT!,
          accessKeyId: process.env.SLS_LOG_KEY!,
          secretAccessKey: process.env.SLS_LOG_SECRET!,
          apiVersion: '2015-06-01',
          projectName: process.env.SLS_LOG_PROJECT_NAME!,
          logStoreName: process.env.SLS_LOG_LOG_STORE_NAME!,
          topic: 'cool',
          source: 'app-a',
        })
      );

    logger.debug({
      target: 'project',
    });

    logger
      .child({
        sls: {
          projectName: process.env.SLS_LOG_PROJECT_NAME_2!,
          logStoreName: process.env.SLS_LOG_LOG_STORE_NAME_2!,
          topic: 'hey',
          source: 'app-b',
        },
      })
      .debug({
        target: 'project2',
      });
  });
});
