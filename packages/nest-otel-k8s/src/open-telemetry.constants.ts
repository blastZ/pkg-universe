import { OpenTelemetryModuleConfig } from './open-telemetry.interface.js';
import {
  ControllerInjector,
  DecoratorInjector,
  GuardInjector,
  InterceptorInjector,
  LoggerInjector,
  MiddlewareInjector,
  PipeInjector,
  ProviderInjector,
  ScheduleInjector,
  TypeormInjector,
} from './trace/injectors/index.js';

export const defaultConfig: OpenTelemetryModuleConfig = {
  autoInjectors: [
    DecoratorInjector,
    ScheduleInjector,
    ControllerInjector,
    GuardInjector,
    PipeInjector,
    InterceptorInjector,
    TypeormInjector,
    LoggerInjector,
    ProviderInjector,
    MiddlewareInjector,
  ],
};
