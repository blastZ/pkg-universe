# nest-oidc-provider

The [oidc-provider](https://github.com/panva/node-oidc-provider) module for [Nest](https://github.com/nestjs/nest).

## Installation

```bash
npm install @blastz/nest-oidc-provider
```

## Usage

### Register Module

```ts
// oidc-config-factory.service.ts
import { OidcConfig, OidcConfigFactory } from '@blastz/nest-oidc-provider';

@Injectable()
export class OidcConfigFactoryService implements OidcConfigFactory {
  constructor() {}

  createOidcConfig(): OidcConfig {
    return {
      configuration: {
        // your oidc-provider configuration
      },
    };
  }
}

// oidc-config-factory.module.ts
@Module({
  providers: [OidcConfigFactoryService],
  exports: [OidcConfigFactoryService],
  imports: [],
})
export class OidcConfigFactoryModule {}

// app.module.ts
import { OidcModule } from '@blastz/nest-oidc-provider';

@Module({
  imports: [
    OidcModule.forRootAsync({
      imports: [OidcConfigFactoryModule],
      useClass: OidcConfigFactoryService,
    }),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
```

### Use Provider

```ts
import { Provider, OidcService } from '@blastz/nest-oidc-provider';

@Injectable()
export class OidcHelperService {
  private provider: Provider;

  constructor(private oidcService: OidcService) {
    this.provider = this.oidcService.getProvider();
  }
}
```
