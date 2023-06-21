import { Injectable, Logger, Scope } from '@nestjs/common';
import type { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper.js';
import type { Attributes } from '@opentelemetry/api';

import { AttributeNames, ProviderScope } from '../../open-telemetry.enums.js';
import { BaseInjector } from './base.injector.js';

enum SchedulerType {
  CRON = 1,
  TIMEOUT = 2,
  INTERVAL = 3,
}

export enum ScheduleAttributes {
  TYPE = 'schedule.type',
  NAME = 'schedule.name',
  TIMEOUT = 'schedule.timeout',
  CRON_EXPRESSION = 'schedule.cron.expression',
}

@Injectable()
export class ScheduleInjector extends BaseInjector {
  private static SCHEDULE_CRON_OPTIONS = 'SCHEDULE_CRON_OPTIONS';
  private static SCHEDULE_INTERVAL_OPTIONS = 'SCHEDULE_INTERVAL_OPTIONS';
  private static SCHEDULE_TIMEOUT_OPTIONS = 'SCHEDULE_TIMEOUT_OPTIONS';
  private static SCHEDULER_NAME = 'SCHEDULER_NAME';
  private static SCHEDULER_TYPE = 'SCHEDULER_TYPE';

  private readonly logger = new Logger(ScheduleInjector.name);

  public inject(): void {
    for (const provider of [...this.getProviders(), ...this.getControllers()]) {
      const prototype = provider.metatype.prototype;
      const keys = this.metadataScanner.getAllMethodNames(prototype);

      for (const key of keys) {
        if (
          !this.isDecorated(prototype[key]) &&
          !this.isAffected(prototype[key]) &&
          this.isScheduler(prototype[key])
        ) {
          const name = this.getName(provider, prototype[key]);
          prototype[key] = this.wrap(prototype[key], name, {
            attributes: {
              [AttributeNames.MODULE]: provider.host?.name,
              [AttributeNames.PROVIDER]: provider.name,
              [AttributeNames.PROVIDER_SCOPE]:
                provider.scope != null
                  ? Scope[provider.scope]
                  : ProviderScope.DEFAULT,
              [AttributeNames.PROVIDER_METHOD]: prototype[key].name,
              [AttributeNames.INJECTOR]: ScheduleInjector.name,
              ...this.getAttributes(prototype[key]),
            },
          });
          this.logger.log(`Mapped ${name}`);
        }
      }
    }
  }

  private isScheduler(func: Function): boolean {
    return Reflect.hasMetadata(ScheduleInjector.SCHEDULER_TYPE, func);
  }

  private getName(provider: InstanceWrapper, func: Function): string {
    const schedulerType: SchedulerType = Reflect.getMetadata(
      ScheduleInjector.SCHEDULER_TYPE,
      func,
    );
    const name = Reflect.getMetadata(ScheduleInjector.SCHEDULER_NAME, func);
    switch (schedulerType) {
      case SchedulerType.CRON:
        return `Scheduler -> Cron -> ${provider.name}.${name || func.name}`;
      case SchedulerType.TIMEOUT:
        return `Scheduler -> Timeout -> ${provider.name}.${name || func.name}`;
      case SchedulerType.INTERVAL:
        return `Scheduler -> Interval -> ${provider.name}.${name || func.name}`;
    }
  }

  private getAttributes(func: Function): Attributes {
    const schedulerType = Reflect.getMetadata(
      ScheduleInjector.SCHEDULER_TYPE,
      func,
    );
    const attributes: Attributes = {
      [ScheduleAttributes.TYPE]: SchedulerType[schedulerType],
      [ScheduleAttributes.NAME]: Reflect.getMetadata(
        ScheduleInjector.SCHEDULER_NAME,
        func,
      ),
    };
    if (
      SchedulerType.TIMEOUT === schedulerType ||
      SchedulerType.INTERVAL === schedulerType
    ) {
      const options = Reflect.getMetadata(
        schedulerType === SchedulerType.TIMEOUT
          ? ScheduleInjector.SCHEDULE_TIMEOUT_OPTIONS
          : ScheduleInjector.SCHEDULE_INTERVAL_OPTIONS,
        func,
      );
      attributes[ScheduleAttributes.TIMEOUT] = options?.timeout;
    }
    if (SchedulerType.CRON === schedulerType) {
      const options = Reflect.getMetadata(
        ScheduleInjector.SCHEDULE_CRON_OPTIONS,
        func,
      );
      attributes[ScheduleAttributes.CRON_EXPRESSION] = options?.cronTime;
    }
    return attributes;
  }
}
