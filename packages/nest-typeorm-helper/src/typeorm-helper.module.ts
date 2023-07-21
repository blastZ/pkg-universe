import { DynamicModule, Provider } from '@nestjs/common';
import {
  TypeOrmModule,
  TypeOrmModuleOptions,
  getDataSourceToken,
} from '@nestjs/typeorm';
import { DataSource, EntitySchema } from 'typeorm';

import { getCustomRepositoryToken } from './token.util.js';

export class TypeormHelperModule {
  static forRoot(
    options: TypeOrmModuleOptions & {
      repositories: (new (...args: any) => any)[];
    },
  ): DynamicModule {
    const { repositories, ...typeormOptions } = options;

    const token = getDataSourceToken(typeormOptions.name);

    const entities: EntitySchema[] = [];
    const providers: Provider[] = [];

    repositories.map((repository) => {
      const entity = Reflect.getMetadata(
        getCustomRepositoryToken(),
        repository,
      );

      if (entity) {
        entities.push(entity);

        const provider: Provider = {
          provide: repository,
          useFactory: (dataSource: DataSource) => {
            const baseRepo = dataSource.getRepository(entity);

            return new repository(
              baseRepo.target,
              baseRepo.manager,
              baseRepo.queryRunner,
            );
          },
          inject: [token],
        };

        providers.push(provider);
      }
    });

    return {
      module: TypeormHelperModule,
      providers,
      exports: providers,
      imports: [TypeOrmModule.forRoot({ ...typeormOptions, entities })],
      global: true,
    };
  }
}
