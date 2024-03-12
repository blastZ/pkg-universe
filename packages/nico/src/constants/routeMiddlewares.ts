export enum InnerRouteMiddleware {
  CONTROLLER_CORS = 'controller-cors',
  CSP = 'csp',
  XFRAMES = 'xframes',
  POLICIES = 'policies',
  BODY_PARSER = 'body-parser',
  VALIDATE = 'validate',
  CONTROLLER = 'controller',
}

export const ROUTE_MIDDLEWARES = [
  InnerRouteMiddleware.CONTROLLER_CORS,
  InnerRouteMiddleware.CSP,
  InnerRouteMiddleware.XFRAMES,
  InnerRouteMiddleware.POLICIES,
  InnerRouteMiddleware.BODY_PARSER,
  InnerRouteMiddleware.VALIDATE,
  InnerRouteMiddleware.CONTROLLER,
];
