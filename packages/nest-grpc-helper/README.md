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
      },
    ]),
  ],
})
export class AppModule {}
```

Get service instance

```ts
import { GrpcClientsService, ServiceProxy } from '@blastz/nest-grpc-helper';

@Injectable()
export class AppService implements OnModuleInit {
  private usersService: ServiceProxy;

  constructor(private grpcClientsService: GrpcClientsService) {}

  onModuleInit() {
    this.grpcUsersService = this.grpcClientsService.getService(
      'pkgUniverse.accountManager',
      'UsersService'
    );
  }

  getUserById(id: string) {
    return this.usersService.send('getUserById', { id });
  }
}
```

## License

Licensed under MIT
