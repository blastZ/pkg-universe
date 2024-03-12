import { Context, Next } from 'koa';

export default function getNotFoundMiddleware() {
  return async function notFoundMiddleware(ctx: Context, next: Next) {
    await next();

    if (ctx.status === 404) {
      ctx.logger.trace({
        url: `${ctx.method} ${ctx.url}`,
        stage: 'nico.appMiddleware.notFoundHandler',
        message: 'not found',
      });

      if (ctx.onNotFound) {
        return ctx.onNotFound();
      }
    }
  };
}
