import cluster from 'cluster';
import os from 'os';

import { createConsoleTransport, logger, LoggerLevel } from '@blastz/logger';
import Router from '@koa/router';
import Koa from 'koa';

import defaultConfig from './config/index.js';
import {
  APP_MIDDLEWARES,
  InnerAppMiddleware,
  InnerRouteMiddleware,
  ROUTE_MIDDLEWARES,
} from './constants/index.js';
import {
  Config,
  CustomMiddlewares,
  DefaultCustom,
  DefaultState,
  InputConfig,
  Middleware,
} from './interfaces/index.js';
import cors from './middleware/cors/index.js';
import errorHandler from './middleware/error-handler/index.js';
import getHelperMiddleware from './middleware/helper/index.js';
import notFoundHandler from './middleware/not-found-handler/index.js';
import responses from './middleware/responses/index.js';
import nicoRouter from './middleware/router/index.js';
import serve from './middleware/serve/index.js';
import trace from './middleware/trace/index.js';
import deepmerge from './utils/deepmerge.js';
import { createUid, mergeConfigs } from './utils/utility.js';

export { InnerAppMiddleware, InnerRouteMiddleware } from './constants/index.js';
export * from './interfaces/index.js';

export type NicoCustom = {
  [key: string]: any;
};

logger.clear().add(createConsoleTransport({ level: LoggerLevel.Info }));

export class Nico extends Koa {
  #initialed = false;

  #started = false;

  #config: Config<any, any>;

  #custom: NicoCustom = {};

  customMiddlewares: CustomMiddlewares = {};

  appMiddlewares: (InnerAppMiddleware | string)[] = APP_MIDDLEWARES;

  routeMiddlewares: (InnerRouteMiddleware | string)[] = ROUTE_MIDDLEWARES;

  #signalHandlers: { [key: string]: SignalHandler } = {
    SIGINT: () => {},
    SIGTERM: () => {},
  };

  get initialed() {
    return this.#initialed;
  }

  get started() {
    return this.#started;
  }

  get config() {
    return Object.freeze(this.#config);
  }

  get custom() {
    return JSON.parse(JSON.stringify(this.#custom));
  }

  constructor() {
    super();

    this.#config = defaultConfig;

    this.context.helper = {};

    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'production';
    }
  }

  private getCustomMiddlewares(
    middlewares: string[],
    middleware: Middleware,
    after: string,
  ) {
    let name = middleware.name.trim();
    if (!name) {
      name = createUid();
      logger.warn(`custom middleware need a name, use uuid ${name} instead`);
    }

    if (this.customMiddlewares[name]) {
      logger.warn(
        `custom middleware ${name} already exist, previous one will be used`,
      );
    } else {
      this.customMiddlewares[name] = middleware;
    }

    let result = middlewares;

    const index = middlewares.findIndex((o) => o === after);
    if (index < 0) {
      result = [name].concat(middlewares);
    } else {
      result = middlewares
        .slice(0, index + 1)
        .concat([name])
        .concat(middlewares.slice(index + 1));
    }

    return result;
  }

  useAppMiddleware(
    middleware: Middleware,
    after: InnerAppMiddleware | string = InnerAppMiddleware.GLOBAL_CORS,
  ) {
    if (this.#initialed) {
      throw new Error(
        'ERR_USE_APP_MIDDLEWARE: custom app middleware should be used before init',
      );
    }

    this.appMiddlewares = this.getCustomMiddlewares(
      this.appMiddlewares,
      middleware,
      after,
    );
  }

  useRouteMiddleware(
    middleware: Middleware,
    after: InnerRouteMiddleware | string = InnerRouteMiddleware.CONTROLLER_CORS,
  ) {
    if (this.#initialed) {
      throw new Error(
        'ERR_USE_ROUTE_MIDDLEWARE: custom route middleware should be used before init',
      );
    }

    this.routeMiddlewares = this.getCustomMiddlewares(
      this.routeMiddlewares,
      middleware,
      after,
    );
  }

  useSignalHandler(
    signalOrSignals: NodeJS.Signals | NodeJS.Signals[],
    handler: SignalHandler,
  ) {
    if (this.#started) {
      logger.warn('You must call useSignal before start');
      return;
    }

    const signals = Array.isArray(signalOrSignals)
      ? signalOrSignals
      : [signalOrSignals];
    signals.forEach((signal) => {
      this.#signalHandlers[signal.toUpperCase()] = handler;
    });
  }

  setCustom(custom: { [key: string]: any }) {
    this.#custom = deepmerge(this.#custom, custom);
  }

  init<TState = DefaultState, TCustom = DefaultCustom>(
    ...inputConfigs: InputConfig<TState, TCustom>[]
  ) {
    if (this.#initialed) {
      logger.warn('nico can only be initialized once');
      return;
    }

    this.#config = mergeConfigs<TState, TCustom>(
      this.#config,
      ...inputConfigs,
    ) as Config<TState, TCustom>;
    const config = { ...this.#config };

    this.context.config = config;
    this.context.logger = logger;

    this.use(getHelperMiddleware(config.helpers));
    Object.keys(config.helpers).map((key) => {
      this.context.helper[key] = config.helpers[key].bind(this.context);
      return undefined;
    });

    this.appMiddlewares.forEach((name) => {
      if (name === InnerAppMiddleware.ERROR_HANDLER) {
        this.use(errorHandler());
      } else if (name === InnerAppMiddleware.TRACE) {
        this.use(trace());
      } else if (name === InnerAppMiddleware.NOT_FOUND_HANDLER) {
        this.use(notFoundHandler());
      } else if (name === InnerAppMiddleware.GLOBAL_CORS) {
        this.use(cors(config.security?.cors));
      } else if (name === InnerAppMiddleware.RESPONSES) {
        this.use(responses(config.responses));
      } else if (name === InnerAppMiddleware.SERVE) {
        const serveRouter = new Router();
        this.use(serve(serveRouter, config.serve));
        this.use(serveRouter.routes()).use(serveRouter.allowedMethods());
      } else if (name === InnerAppMiddleware.ROUTES) {
        const router = new Router<DefaultState, DefaultCustom>(
          config.advancedConfigs?.routerOptions,
        );
        this.use(
          nicoRouter(router, config, {
            routeMiddlewares: this.routeMiddlewares,
            customMiddlewares: this.customMiddlewares,
          }),
        );
        this.use(router.routes()).use(router.allowedMethods());
      } else {
        const middleware = this.customMiddlewares[name];

        if (middleware) {
          this.use(middleware);
        } else {
          logger.warn(
            `${name} is defined in nico.appMiddlewares but doesn't be implemented in config.middlewares`,
          );
        }
      }
    });

    this.#initialed = true;
  }

  private createServer(port = 1314, listener?: (this: Nico) => void) {
    const server = this.listen(port, listener);

    const getSignalListener: (
      handler: SignalHandler,
    ) => NodeJS.SignalsListener = (handler) => (signal) => {
      const selfLogger = logger.child({ stage: `process.on(${signal})` });
      selfLogger.trace({
        ...(cluster.worker
          ? { pid: cluster.worker.process.pid, workerId: cluster.worker.id }
          : {}),
        message: `hit signal handler`,
      });

      const timeout = setTimeout(() => {
        selfLogger.error({
          forceExitTime: this.config.advancedConfigs.forceExitTime,
          message: `signal handler execute too long, force exit fired`,
        });
        process.exit(1);
      }, this.config.advancedConfigs.forceExitTime);

      server.close(async (err) => {
        let code = 0;
        if (err) {
          code = 1;
          selfLogger.error(err);
          handler && (await handler.call(this, err));
        } else {
          handler && (await handler.call(this));
        }

        clearTimeout(timeout);
        process.exit(code);
      });
    };

    Object.entries(this.#signalHandlers).map(([signal, handler]) => {
      process.on(signal as NodeJS.Signals, getSignalListener(handler));
      return undefined;
    });

    process.on('uncaughtException', (err) => {
      logger.fatal({
        stage: 'process.on(uncaughtException)',
        message: err.message,
        stack: err.stack,
      });
    });

    return server;
  }

  start(port = 1314, listener?: (this: Nico) => void) {
    if (this.#started) {
      logger.error('nico already started');
      return undefined;
    }

    if (!this.#initialed) {
      this.init();
      logger.warn('nico need init before start, auto init fired');
    }

    logger.info({
      port,
      pid: process.pid,
      message: `app started`,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        ...(process.env.APP_ENV ? { APP_ENV: process.env.APP_ENV } : {}),
      },
    });

    return this.createServer(port, listener?.bind(this));
  }

  startCluster(port = 1314, instances = os.cpus().length) {
    let closing = false;

    cluster.on('online', (worker) => {
      logger.trace({
        pid: worker.process.pid,
        workerId: worker.id,
        message: 'worker start',
      });
    });

    cluster.on('exit', (worker, code) => {
      logger.trace({
        pid: worker.process.pid,
        workerId: worker.id,
        code,
        message: `worker exit`,
      });

      !closing && cluster.fork();
    });

    if (cluster.isMaster) {
      logger.info({
        port,
        pid: process.pid,
        instances,
        env: {
          NODE_ENV: process.env.NODE_ENV,
          ...(process.env.APP_ENV ? { APP_ENV: process.env.APP_ENV } : {}),
        },
        message: 'app started with cluster mode',
      });

      for (let i = 0; i < instances; i += 1) {
        cluster.fork();
      }

      Object.keys(this.#signalHandlers).map((signal) =>
        process.on(signal as NodeJS.Signals, () => {
          closing = true;
          Object.values(cluster.workers || []).map(
            (work) => work?.kill(signal),
          );
        }),
      );
    } else {
      this.createServer(port);
    }
  }

  mergeConfigs = mergeConfigs;
}

let nico: Nico;

export function getNico() {
  if (nico) return nico;
  nico = new Nico();
  return nico;
}

export default getNico();

export type SignalHandler = (this: Nico, error?: Error) => void;
