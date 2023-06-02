import { DynamicModule, Provider } from '@nestjs/common';
import { ClientProxyFactory } from '@nestjs/microservices';

import { getGrpcClientOptions } from '../grpc-options/index.js';
import { serviceProxyToken } from '../service-proxy/service-proxy-token.util.js';
import { GRPC_CLIENTS_OPTIONS } from './constants/grpc-clients-options.constant.js';
import { GRPC_CLIENTS } from './constants/grpc-clients.constant.js';
import { GrpcClientsService } from './grpc-clients.service.js';
import { GrpcClientsOptions } from './interfaces/grpc-clients-options.interface.js';
import { GrpcClients } from './interfaces/grpc-clients.interface.js';

export class GrpcClientsModule {
  static forRoot(options: GrpcClientsOptions): DynamicModule {
    const serviceProviders: Provider[] = [];

    options.map((o) => {
      const { packageName, services = [] } = o;

      const providers = services.map((serviceName) => {
        const provider: Provider = {
          provide: serviceProxyToken(packageName, serviceName),
          useFactory: (clientsService: GrpcClientsService) => {
            return clientsService.getService(packageName, serviceName);
          },
          inject: [GrpcClientsService],
        };

        return provider;
      });

      serviceProviders.push(...providers);
    });

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
                ClientProxyFactory.create(getGrpcClientOptions(o)) as any,
              );
            });

            return clients;
          },
        },
        ...serviceProviders,
      ],
      exports: [GrpcClientsService, ...serviceProviders],
      global: true,
    };
  }
}
