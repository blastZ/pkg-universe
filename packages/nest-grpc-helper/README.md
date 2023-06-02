# Nest Grpc Helper

## Getting started

Install nest-grpc-helper

```bash
npm install @blastz/nest-grpc-helper
```

## Protos

Proto file loader path is based on package name, if the package name is `pkgUniverse.accountManager`,
then the proto file will be load from `protos/pkg-universe/account-manager/main.proto`.

The `protos` folder should in the top of the current working directory.

## Examples

Create grpc app

```ts
import { createGrpcApp } from '@blastz/nest-grpc-helper';

const app = await createGrpcApp(AppModule, {
  packageName: 'pkgUniverse.accountManager',
  url: '0.0.0.0:3000',
});
```

Register grpc clients

```ts
import { GrpcClientsModule } from '@blastz/nest-grpc-helper';

@Module({
  imports: [
    GrpcClientsModule.forRoot([
      {
        packageName: 'pkgUniverse.accountManager',
        url: '0.0.0.0:3000',
        // change default request options
        timeout: 1000, // default is 3000ms
        retryCount: 10, // default is 3
        retryDelay: 1000, // default is 0
      },
    ]),
  ],
})
export class AppModule {}
```

Get service instance

```ts
import { ServiceProxyDec, ServiceProxy } from '@blastz/nest-grpc-helper';

@Injectable()
export class AppService {
  constructor(
    @ServiceProxyDec('pkgUniverse.accountManager', 'UsersService')
    private usersService: ServiceProxy,
  ) {}

  getUserById(id: string) {
    return this.usersService.send(
      'getUserById',
      { id },
      // rewrite global request options
      { timeout: 5000, retryCount: 5, retryDelay: 2000 },
    );
  }
}
```

Get `Promise` response instead of `Observable`

```ts
@Injectable()
export class AppService implements OnModuleInit {
  // ...

  getUserById(id: string) {
    return this.usersService.pSend('getUserById', { id });
  }
}
```

## Health check

This feature depends on [gRPC Health Checking Protocol](https://github.com/grpc/grpc/blob/master/doc/health-checking.md)

Enable `healthCheck` feature

```ts
const app = await createGrpcApp(AppModule, {
  packageName: 'accountManager',
  url: '0.0.0.0:3000',
  healthCheck: true,
});
```

Implement health check method

```ts
import {
  HEALTH_SERVICE_NAME,
  HealthCheckRequest,
  HealthCheckResponse,
  ServingStatus,
} from '@blastz/nest-grpc-helper';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class HealthController {
  @GrpcMethod(HEALTH_SERVICE_NAME)
  check(data: HealthCheckRequest): HealthCheckResponse {
    return {
      status: ServingStatus.SERVING,
    };
  }
}
```

## License

Licensed under MIT
