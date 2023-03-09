import { AsyncLocalStorage } from 'async_hooks';
import { NextFunction, Request, Response } from 'express';

interface Store {
  headers: Record<string, string | string[] | undefined>;
}

export const propagationContext = new AsyncLocalStorage<Store>();

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
