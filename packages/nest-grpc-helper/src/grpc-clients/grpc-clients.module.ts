import { DynamicModule } from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';

import { getGrpcClientOptions } from '../grpc-options/index.js';
import { GRPC_CLIENTS_OPTIONS } from './constants/grpc-clients-options.constant.js';
import { GRPC_CLIENTS } from './constants/grpc-clients.constant.js';
import { GrpcClientsService } from './grpc-clients.service.js';
import { GrpcClientsOptions } from './interfaces/grpc-clients-options.interface.js';
import { GrpcClients } from './interfaces/grpc-clients.interface.js';

export class GrpcClientsModule {
  static forRoot(options: GrpcClientsOptions): DynamicModule {
    return {
      module: GrpcClientsModule,
      imports: [],
      providers: [
        {
          provide: GRPC_CLIENTS_OPTIONS,
          useValue: options,
        },
        GrpcClientsService,
        {
          provide: GRPC_CLIENTS,
          useFactory: () => {
            const clients: GrpcClients = new Map();

            options.map((o) => {
              clients.set(
                o.packageName,
                ClientProxyFactory.create(getGrpcClientOptions(o)) as any
              );
            });

            return clients;
          },
        },
      ],
      exports: [GrpcClientsService],
      global: true,
    };
  }
}
