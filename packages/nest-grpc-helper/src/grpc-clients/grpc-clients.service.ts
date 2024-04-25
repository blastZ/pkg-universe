import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { healthClientKey } from '../grpc-health/health-client-key.util.js';
import { ServiceProxy } from '../service-proxy/index.js';

import { GRPC_CLIENTS_OPTIONS } from './constants/grpc-clients-options.constant.js';
import { GRPC_CLIENTS } from './constants/grpc-clients.constant.js';
import type {
  GrpcClientOptions,
  GrpcClients,
  GrpcClientsOptions,
} from './interfaces/index.js';

@Injectable()
export class GrpcClientsService {
  private serviceMap: Map<string, any> = new Map();
  private optionsMap: Map<string, GrpcClientOptions> = new Map();

  constructor(
    @Inject(GRPC_CLIENTS) private clients: GrpcClients,
    @Inject(GRPC_CLIENTS_OPTIONS) options: GrpcClientsOptions,
  ) {
    options.map((o) => {
      this.optionsMap.set(o.packageName, o);

      if (o.healthCheck) {
        this.optionsMap.set(healthClientKey(o.packageName), o);
      }
    });
  }

  private getClient(clientKey: string) {
    const client = this.clients.get(clientKey);

    if (!client) {
      throw new InternalServerErrorException('ERR_CLIENT_NOT_FOUND');
    }

    return client;
  }

  getService(clientKey: string, serviceName: string) {
    const key = `${clientKey}_${serviceName}`;

    let service = this.serviceMap.get(key);

    if (!service) {
      service = this.getClient(clientKey).getService(serviceName);

      this.serviceMap.set(key, service);
    }

    const options = this.optionsMap.get(clientKey);

    if (!options) {
      throw new InternalServerErrorException('ERR_CLIENT_OPTIONS_NOT_FOUND');
    }

    return new ServiceProxy(serviceName, service, options);
  }
}
