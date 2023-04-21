import {
  Controller,
  DynamicModule,
  Global,
  Module,
  Provider,
} from '@nestjs/common';
import OidcProvider from 'oidc-provider';

import {
  OIDC_CONFIG,
  OidcConfig,
  OidcConfigFactory,
  OidcDynamicConfig,
} from './oidc.config.js';
import { OidcController } from './oidc.controller.js';
import { OidcService } from './oidc.service.js';

@Global()
@Module({
  providers: [OidcService],
  exports: [OidcService],
})
export class OidcModule {
  static forRoot(config: OidcConfig): DynamicModule {
    const oidcProvider = this.createOidcProvider();

    return {
      module: OidcModule,
      providers: [
        {
          provide: OIDC_CONFIG,
          useValue: config,
        },
        oidcProvider,
      ],
      exports: [],
      controllers: [OidcController],
    };
  }

  static forRootAsync(config: OidcDynamicConfig): DynamicModule {
    const providers = this.createAsyncProviders(config);
    const oidcProvider = this.createOidcProvider();

    return {
      module: OidcModule,
      imports: config.imports,
      providers: [...providers, oidcProvider],
      exports: [],
      controllers: [OidcController],
    };
  }

  private static createOidcProvider(): Provider {
    return {
      provide: OidcProvider,
      useFactory: (config: OidcConfig) => {
        const oidcProvider = new OidcProvider(
          config.issuer,
          config.configuration,
        );

        if (config.path) {
          Controller({
            path: config.path,
          })(OidcController);
        }

        return oidcProvider;
      },
      inject: [OIDC_CONFIG],
    };
  }

  private static createAsyncProviders(config: OidcDynamicConfig): Provider[] {
    if (config.useFactory) {
      return [
        {
          provide: OIDC_CONFIG,
          useFactory: config.useFactory,
          inject: config.inject,
        },
      ];
    }

    if (config.useClass || config.useExist) {
      return [
        {
          provide: OIDC_CONFIG,
          useFactory: async (configFactory: OidcConfigFactory) => {
            return await configFactory.createOidcConfig();
          },
          inject: [config.useClass || config.useExist!],
        },
      ];
    }

    return [];
  }
}
