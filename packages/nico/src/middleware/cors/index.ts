import { Context, Next } from 'koa';

import { CorsOptions } from '../../interfaces/index.js';

export default function getCorsMiddleware(config?: CorsOptions, global = true) {
  const options: CorsOptions = {
    allowOrigins: ['http://127.0.0.1'],
    allowCredentials: false,
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
    allowHeaders: 'Origin, Content-Type, Method',
    maxAge: 60,
    ...config,
  };

  options.maxAge = Number(options.maxAge);

  if (Array.isArray(options.allowMethods)) {
    options.allowMethods = options.allowMethods.join(',');
  }

  if (Array.isArray(options.allowHeaders)) {
    options.allowHeaders = options.allowHeaders.join(',');
  }

  if (Array.isArray(options.exposeHeaders)) {
    options.exposeHeaders = options.exposeHeaders.join(',');
  }

  const allowedOrigin = options.allowOrigins;
  const { allRoutes } = options;

  const getOrigin = (requestOrigin?: string) => {
    let origin = '';

    if (Array.isArray(allowedOrigin)) {
      if (requestOrigin && allowedOrigin.indexOf(requestOrigin) > -1) {
        origin = requestOrigin;
      }
    } else {
      origin = allowedOrigin;
    }

    return origin;
  };

  const setOrigin = (ctx: Context, origin: string) => {
    origin
      ? ctx.set('Access-Control-Allow-Origin', origin)
      : ctx.remove('Access-Control-Allow-Origin');
  };

  const setCredentials = (ctx: Context, allowCredentials?: boolean) => {
    allowCredentials
      ? ctx.set('Access-Control-Allow-Credentials', 'true')
      : ctx.remove('Access-Control-Allow-Credentials');
  };

  return async function corsMiddleware(ctx: Context, next: Next) {
    const requestOrigin = ctx.request.headers.origin;
    const { method } = ctx;

    if (((global && allRoutes) || !global) && method !== 'OPTIONS') {
      setCredentials(ctx, options.allowCredentials);
      setOrigin(ctx, getOrigin(requestOrigin));

      if (options.exposeHeaders) {
        ctx.set('Access-Control-Expose-Headers', options.exposeHeaders);
      }

      await next();
    } else {
      if (!ctx.get('Access-Control-Request-Method')) {
        await next();
        return;
      }

      setCredentials(ctx, options.allowCredentials);

      if (global) {
        ctx.set('Access-Control-Allow-Origin', requestOrigin || '');
      } else {
        setOrigin(ctx, getOrigin(requestOrigin));
      }

      options.allowMethods &&
        ctx.set('Access-Control-Allow-Methods', options.allowMethods);
      options.maxAge &&
        !Number.isNaN(options.maxAge) &&
        options.maxAge > 0 &&
        ctx.set('Access-Control-Max-Age', String(options.maxAge));

      let { allowHeaders } = options;
      if (!allowHeaders) {
        allowHeaders = ctx.get('Access-Control-Request-Headers');
      }
      allowHeaders && ctx.set('Access-Control-Allow-Headers', allowHeaders);

      ctx.status = 204;

      await next();
    }
  };
}
