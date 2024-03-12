import { Context, Next } from 'koa';

import { ConfigResponses } from '../../interfaces/index.js';

export default function getResponsesMiddleware(
  responses: ConfigResponses = {},
) {
  return async function responsesMiddleware(ctx: Context, next: Next) {
    Object.entries(responses).forEach(([key, value]) => {
      ctx[key] = value.bind(ctx);
    });

    await next();
  };
}
