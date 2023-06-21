import { Logger } from '@nestjs/common';
import { context, trace } from '@opentelemetry/api';

import type { Injector } from './injector.js';

export class LoggerInjector implements Injector {
  public inject(): void {
    Logger.prototype.log = this.wrap(Logger.prototype.log, 'log');
    Logger.prototype.debug = this.wrap(Logger.prototype.debug, 'debug');
    Logger.prototype.error = this.wrap(Logger.prototype.error, 'error');
    Logger.prototype.verbose = this.wrap(Logger.prototype.verbose, 'verbose');
    Logger.prototype.warn = this.wrap(Logger.prototype.warn, 'warn');
  }

  private wrap(func: Function, eventName?: string) {
    return {
      [func.name](...args: any[]) {
        const currentSpan = trace.getSpan(context.active());
        if (currentSpan) {
          currentSpan.addEvent(eventName ?? func.name, {
            message: args[0],
          });
        }

        return func.apply(this, args);
      },
    }[func.name];
  }
}
