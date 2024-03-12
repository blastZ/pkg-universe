import path from 'node:path';

import Router from '@koa/router';
import serve from 'koa-static';

import { ConfigServe, Context, Next } from '../../interfaces/index.js';

export default function getServeMiddleware(
  router: Router,
  config?: ConfigServe | ConfigServe[],
) {
  if (config) {
    const configs: ConfigServe[] = Array.isArray(config) ? config : [config];

    const mounted: string[] = [];

    configs.forEach((o) => {
      const { root, route = '/assets', traceLog = false, opts } = o || {};

      if (mounted.includes(route)) {
        throw new Error(`ERR_SERVE_ROUTE: dumplicated serve route '${route}'`);
      }

      if (root) {
        mounted.push(route);

        router.get(
          `${route}/(.+)`,
          async (ctx: Context, next: Next) => {
            ctx.path = ctx.path.slice(route.length);
            traceLog &&
              ctx.logger
                .child({ stage: 'nico.appMiddleware.serve' })
                .trace('serve static files');
            await next();
          },
          serve(path.resolve(process.cwd(), root), {
            defer: false,
            maxAge: 1 * 24 * 3600 * 1000,
            ...opts,
          }),
        );
      }
    });
  }

  return async function serveMiddleware(ctx: Context, next: Next) {
    await next();
  };
}
