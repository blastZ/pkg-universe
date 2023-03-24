import { logger } from '@blastz/logger';
import { NextFunction, Request, Response } from 'express';

import { v4 as uuid } from 'uuid';

import { context } from './context.js';

const REQUEST_ID_HEADER = 'x-request-id';

export function traceMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = req.headers[REQUEST_ID_HEADER] || uuid();

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
        reqIp: req.ip,
        reqIps: req.ips,
        referer: req.headers.referer,
        userAgent: req.headers['user-agent'],
      })
      .trace('request in');

    next();
  });
}
