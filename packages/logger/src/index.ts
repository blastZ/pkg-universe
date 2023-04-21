import { AsyncLocalStorage } from 'node:async_hooks';
import { hostname } from 'node:os';
import { createLogger, format } from 'winston';

import { LEVELS } from './constants/index.js';
import { LoggerLevel } from './enums/index.js';
import { Logger } from './interfaces/index.js';

const originLogger = createLogger({
  level: LoggerLevel.Info,
  levels: LEVELS,
  format: format.errors({ stack: true }),
  defaultMeta: {
    host: hostname(),
    pid: process.pid,
  },
  transports: [],
}) as Logger;

let context: AsyncLocalStorage<Record<string, unknown>> | undefined;

export const logger = new Proxy(originLogger, {
  get: (t, p, r) => {
    const store = context?.getStore();

    if (store) {
      return Reflect.get(t.child(store), p, r);
    }

    return Reflect.get(t, p, r);
  },
  set: (t, p, v, r) => {
    if (p === 'context') {
      context = v;

      return true;
    }

    return Reflect.set(t, p, v, r);
  },
}) as Logger & {
  context: typeof context;
};

export * from './enums/index.js';
export * from './formats/index.js';
export * from './interfaces/index.js';
export * from './transports/index.js';
