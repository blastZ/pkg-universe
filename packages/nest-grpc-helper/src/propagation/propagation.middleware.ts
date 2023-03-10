import { NextFunction, Request, Response } from 'express';

import { propagationContext } from './context.js';

export function propagationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const headers = req.headers;

  propagationContext.run({ headers }, () => {
    next();
  });
}
