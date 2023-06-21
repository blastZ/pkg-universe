import { Injectable, Logger } from '@nestjs/common';
import { Injector } from '@nestjs/core/injector/injector.js';

import { AttributeNames } from '../../open-telemetry.enums.js';
import { BaseInjector } from './base.injector.js';

@Injectable()
export class MiddlewareInjector extends BaseInjector {
  private readonly logger = new Logger(MiddlewareInjector.name);
  public inject(): void {
    const metatype = Injector;
    const originMethod = metatype.prototype.loadMiddleware;
    const logger = this.logger;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    metatype.prototype.loadMiddleware = function loadMiddleware(
      ...args: Parameters<Injector['loadMiddleware']>
    ) {
      const instanceWrapper = args[0];
      const prototype = instanceWrapper.metatype.prototype;
      if (prototype.use) {
        if (self.isAffected(prototype.use))
          return originMethod.apply(this, args);

        const traceName = `Middleware -> ${prototype.constructor.name}`;
        prototype.use = self.wrap(prototype.use, traceName, {
          attributes: {
            [AttributeNames.MIDDLEWARE]: prototype.constructor.name,
            [AttributeNames.INJECTOR]: MiddlewareInjector.name,
          },
        });
        logger.log(`Mapped ${traceName}`);
      }
      return originMethod.apply(this, args);
    };
  }
}
