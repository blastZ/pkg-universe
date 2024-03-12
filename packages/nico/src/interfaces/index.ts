import { Logger } from '@blastz/logger';
import Router from '@koa/router';
import { Files } from 'formidable';
import {
  type DefaultContext as KoaDefaultContext,
  type DefaultState as KoaDefaultState,
  type Middleware as KoaMiddleware,
  type Next as KoaNext,
  type ParameterizedContext as KoaParameterizedContext,
} from 'koa';
import { type Options as ServeOptions } from 'koa-static';

import { type Options as BodyParserOpts } from '../middleware/body-parser/index.js';
import { Validate } from '../middleware/router/middleware/validator.js';

export interface ConfigServe {
  root?: string;
  route?: string;
  traceLog?: boolean; // default is false
  opts?: ServeOptions;
}

export type ConfigRoute<TState = DefaultState, TCustom = DefaultCustom> = {
  controller: Middleware<TState, TCustom> | Middleware<TState, TCustom>[];
  policies?: Middleware<TState, TCustom>[] | boolean;
  bodyParser?: boolean | Partial<BodyParserOpts>;
  validate?: Validate;
  timeout?: number;
  cors?: CorsOptions | boolean;
  xframes?: XFrameOptions | true;
  csp?: CSPOptions | true;
};

export type ConfigRoutes<TState = DefaultState, TCustom = DefaultCustom> = {
  [routeOrPrefix: string]:
    | ConfigRoute<TState, TCustom>
    | ConfigRoutes<TState, TCustom>;
};

export type ConfigCustom = {
  [key: string]: any;
};

export type CorsOptions = { allRoutes?: boolean } & {
  allowOrigins: string[] | string;
  allowMethods?: string[] | string;
  allowHeaders?: string[] | string;
  exposeHeaders?: string[] | string;
  allowCredentials?: boolean;
  maxAge?: number;
};

export type CSPOptions = {
  policy: { [key: string]: string };
  reportOnly?: boolean;
  reportUri?: string;
};

export type XFrameOptions = 'DENY' | 'SAMEORIGIN';

export type ConfigSecurity = {
  cors?: CorsOptions;
  xframes?: XFrameOptions;
  csp?: CSPOptions;
};

export type Response = (this: Context, ...args: any) => void;

type DefaultErrorResponse = (this: Context, err: Error) => void;

export type ConfigResponses = {
  onError?: DefaultErrorResponse;
  onBodyParserError?: DefaultErrorResponse;
  onValidateError?: DefaultErrorResponse;
  onNotFound?: (this: Context) => void;
} & {
  [key: string]: Response;
};

export type Helper = (
  this: NicoContext<DefaultState, any>,
  ...args: any
) => any;

export type ConfigHelpers = {
  [key: string]: Helper;
};

export type CustomMiddlewares = {
  [key: string]: Middleware;
};

export type InputConfig<TState = DefaultState, TCustom = DefaultCustom> = {
  routes?: ConfigRoutes<TState, TCustom>;
  custom?: ConfigCustom;
  security?: ConfigSecurity;
  serve?: ConfigServe | ConfigServe[];
  responses?: ConfigResponses;
  helpers?: ConfigHelpers;
  advancedConfigs?: {
    routerOptions?: Router.RouterOptions;
    forceExitTime?: number;
  };
};

export type Config<TState = DefaultState, TCustom = DefaultCustom> = Required<
  InputConfig<TState, TCustom>
>;

export type HttpMethod = 'post' | 'get' | 'delete' | 'put' | 'patch';

export interface DefaultState extends KoaDefaultState {
  query?: any;
  params?: any;
  body?: any;
  files?: Files;
  requestStartTime?: [number, number];
}

export type DefaultHelper = {
  getExecuteTime: () => number;
};

export interface DefaultCustom extends KoaDefaultContext {
  config: Config;
  logger: Logger;
  helper: {
    [key: string]: Helper;
  } & DefaultHelper;
}

export type Context<
  TState = KoaDefaultState,
  TCustom = KoaDefaultContext,
> = KoaParameterizedContext<TState, TCustom>;

export type Next = KoaNext;

export type Middleware<
  TState = KoaDefaultState,
  TCustom = KoaDefaultContext,
> = KoaMiddleware<TState, TCustom>;

export type NicoContext<
  TState = DefaultState,
  TCustom = DefaultCustom,
> = KoaParameterizedContext<TState, TCustom>;

export type NicoNext = Next;

export type NicoMiddleware<
  TState = DefaultState,
  TCustom = DefaultCustom,
> = KoaMiddleware<TState, TCustom>;
