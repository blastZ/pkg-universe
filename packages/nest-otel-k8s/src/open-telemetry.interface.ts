import type { ModuleMetadata, Type } from '@nestjs/common';

import type { Injector } from './trace/injectors/index.js';

export interface OpenTelemetryModuleConfig {
  autoInjectors?: Type<Injector>[];
  injectorsConfig?: {
    [injectorName: string]: unknown;
  };
}

export interface OpenTelemetryModuleAsyncOption
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (
    ...args: any[]
  ) =>
    | Promise<Partial<OpenTelemetryModuleConfig>>
    | Partial<OpenTelemetryModuleConfig>;
  inject?: any[];
}
