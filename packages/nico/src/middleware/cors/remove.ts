import { Context, Next } from 'koa';

export default function getRemoveCorsMiddleware() {
  return async function removeCorsMiddleware(ctx: Context, next: Next) {
    await next();
    ctx.remove('Access-Control-Allow-Origin');
    ctx.remove('Access-Control-Allow-Credentials');
    ctx.remove('Access-Control-Allow-Methods');
    ctx.remove('Access-Control-Allow-Headers');
    ctx.remove('Access-Control-Expose-Headers');
    ctx.remove('Access-Control-Max-Age');
  };
}
