import { Context, Next } from '../../interfaces/index.js';
import { createUid } from '../../utils/utility.js';

function getUrl(ctx: Context) {
  return `${ctx.method} ${ctx.url}`;
}

export default function getTraceMiddleware() {
  const HEADER_REQUEST_ID = 'X-Request-ID';
  const stage = 'nico.appMiddleware.trace';

  return async function traceMiddleware(ctx: Context, next: Next) {
    ctx.state.requestStartTime = process.hrtime();

    const requestId = ctx.get(HEADER_REQUEST_ID) || createUid();

    if (!ctx.get(HEADER_REQUEST_ID)) {
      ctx.set(HEADER_REQUEST_ID, requestId);
    }

    ctx.logger = ctx.logger.child({
      requestId,
      url: getUrl(ctx),
    });

    const logger = ctx.logger.child({ stage });

    logger.trace({ executeTime: 0, message: 'request in' });

    await next();

    logger.trace({
      executeTime: ctx.helper.getExecuteTime(),
      message: 'request out',
    });
  };
}
