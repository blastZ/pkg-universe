import { logger } from '@blastz/logger';
import { NextFunction, Request, Response } from 'express';
import { AsyncLocalStorage } from 'node:async_hooks';
import { v4 as uuid } from 'uuid';

import { traceContext } from './trace-context.js';

const REQUEST_ID_HEADER = 'x-request-id';

export interface Options {
  context?: AsyncLocalStorage<Record<string, unknown>>;
}

export function getTraceMiddleware(options: Options = {}) {
  const { context = traceContext } = options;

  return function traceMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!req.headers[REQUEST_ID_HEADER]) {
      req.headers[REQUEST_ID_HEADER] = uuid();
    }

    const requestId = req.headers[REQUEST_ID_HEADER];

    const startTime = process.hrtime.bigint();

    res.on('finish', () => {
      const endTime = process.hrtime.bigint();
      const duration = (endTime - startTime) / BigInt(1000) / BigInt(1000);

      logger
        .child({
          resStatus: res.statusCode,
          resTime: `${duration}ms`,
        })
        .trace('request out');
    });

    res.setHeader(REQUEST_ID_HEADER, requestId);

    context.run({ requestId }, () => {
      logger
        .child({
          reqMethod: req.method,
          reqUrl: req.originalUrl,
          reqBody: req.body,
          reqIp: req.ip,
          reqIps: req.ips,
          referer: req.headers.referer,
          userAgent: req.headers['user-agent'],
        })
        .trace('request in');

      next();
    });
  };
}
