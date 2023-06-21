import type { DynamicModule, FactoryProvider } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { defaultConfig } from './open-telemetry.constants.js';
import { SDK_CONFIG, SDK_INJECTORS } from './open-telemetry.enums.js';
import type {
  OpenTelemetryModuleAsyncOption,
  OpenTelemetryModuleConfig,
} from './open-telemetry.interface.js';
import type { Injector } from './trace/injectors/index.js';

export class OpenTelemetryModule {
  public static forRoot(
    config: Partial<OpenTelemetryModuleConfig> = {},
  ): DynamicModule {
    config = { ...defaultConfig, ...config };
    const injectors = config?.autoInjectors ?? [];

    return {
      global: true,
      module: OpenTelemetryModule,
      imports: [],
      providers: [
        ...injectors,
        this.buildInjectors(config),
        {
          provide: SDK_CONFIG,
          useValue: config,
        },
      ],
      exports: [],
    };
  }

  private static buildInjectors(
    configuration?: Partial<OpenTelemetryModuleConfig>,
  ): FactoryProvider {
    const injectors = configuration?.autoInjectors ?? [];
    return {
      provide: SDK_INJECTORS,
      useFactory: (...injectors: Injector[]) => {
        for (const injector of injectors) {
          if (injector['inject']) injector.inject();
        }
      },
      inject: [...injectors],
    };
  }

  public static forRootAsync(
    configuration: OpenTelemetryModuleAsyncOption,
  ): DynamicModule {
    return {
      global: true,
      module: OpenTelemetryModule,
      imports: [...(configuration?.imports ?? [])],
      providers: [
        this.buildAsyncInjectors(),
        {
          provide: SDK_CONFIG,
          useFactory: configuration.useFactory,
          inject: configuration.inject,
        },
      ],
      exports: [],
    };
  }

  private static buildAsyncInjectors(): FactoryProvider {
    return {
      provide: SDK_INJECTORS,
      useFactory: async (
        config: OpenTelemetryModuleConfig,
        moduleRef: ModuleRef,
      ) => {
        config = { ...defaultConfig, ...config };
        const injectors = config.autoInjectors ?? defaultConfig.autoInjectors!;

        for (const injector of injectors) {
          const created = await moduleRef.create(injector);
          if (created['inject']) created.inject();
        }

        return {};
      },
      inject: [SDK_CONFIG, ModuleRef],
    };
  }
}
