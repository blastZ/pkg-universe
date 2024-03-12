import { Context, Middleware, Next } from '../../interfaces/index.js';

export default function getPolicyHandleMiddleware(
  policyMiddleware: Middleware<any, any>,
) {
  const policyName = policyMiddleware.name;

  return async function policyHandleMiddleware(ctx: Context, next: Next) {
    ctx.logger = ctx.logger.child({
      stage: `nico.routeMiddleware.policies.${policyName}`,
    });
    ctx.logger.trace(`hit policy`);

    await policyMiddleware(ctx, next);
  };
}
