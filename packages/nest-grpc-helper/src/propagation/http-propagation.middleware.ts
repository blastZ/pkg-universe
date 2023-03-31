import { NextFunction, Request, Response } from 'express';

import { propagationContext } from './propagation-context.js';

export interface Options {}

export function getHttpPropagationMiddleware(options: Options = {}) {
  return function httpPropagationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const headers = req.headers;

    propagationContext.run({ headers }, () => {
      next();
    });
  };
}
