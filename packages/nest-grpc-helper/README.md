# Nest Grpc Helper

## Getting started

Install nest-grpc-helper

```bash
npm install @blastz/nest-grpc-helper
```

## Protos

All proto files must in the root of workspace, for example the package `accountManager`'s file
structure should like:

- protos
  - account-manager
    - main.proto
    - users-service.proto

## Examples

Create grpc app

```ts
import { createGrpcApp } from '@blastz/nest-grpc-helper';

const app = await createGrpcApp(AppModule, {
  packageName: 'accountManager',
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
        packageName: 'accountManager',
        url: '0.0.0.0:3000',
      },
    ]),
  ],
})
export class AppModule {}
```

## License

Licensed under MIT
