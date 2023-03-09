import { Metadata } from '@grpc/grpc-js';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { GRPC_CLIENTS_OPTIONS } from '../../constants/grpc-clients-options.constant.js';
import { GRPC_CLIENTS } from '../../constants/grpc-clients.constant.js';

import { GrpcClientsOptions } from '../../interfaces/grpc-clients-options.interface.js';
import { GrpcClients } from '../../interfaces/grpc-clients.interface.js';
import { propagationContext } from '../propagation/propagation.middleware.js';

@Injectable()
export class GrpcClientsService {
  private serviceMap: Map<string, any> = new Map();

  constructor(
    @Inject(GRPC_CLIENTS) private clients: GrpcClients,
    @Inject(GRPC_CLIENTS_OPTIONS) private options: GrpcClientsOptions
  ) {}

  private getClient(packageName: string) {
    const target = this.options.find((o) => o.packageName === packageName);

    if (!target) {
      throw new InternalServerErrorException('ERR_PACKAGE_NOT_FOUND');
    }

    const client = this.clients.get(target.packageName);

    if (!client) {
      throw new InternalServerErrorException('ERR_CLIENT_NOT_FOUND');
    }

    return client;
  }

  private getService(packageName: string, serviceName: string) {
    let service = this.serviceMap.get(packageName);

    if (!service) {
      service = this.getClient(packageName).getService(serviceName);

      this.serviceMap.set(packageName, service);
    }

    return service;
  }

  private getMetadata(
    packageName: string,
    meta?: Record<string, string | Buffer>
  ) {
    const metadata = new Metadata();

    const option = this.options.find((o) => o.packageName === packageName);

    if (option && option.propagationHeaders) {
      const propagation = propagationContext.getStore();

      if (propagation) {
        option.propagationHeaders.map((key) => {
          const value = propagation.headers[key];

          if (value) {
            metadata.add(key, String(value));
          }
        });
      }
    }

    if (meta) {
      Object.keys(meta).map((key) => {
        metadata.add(key, meta[key]);
      });
    }

    return metadata;
  }

  send(
    packageNameAndServiceName: string,
    data: any,
    meta?: Record<string, string | Buffer>
  ) {
    const [packageName, serviceName, methodName] =
      packageNameAndServiceName.split('.');

    const metadata = this.getMetadata(packageName, meta);

    return this.getService(packageName, serviceName)[methodName](
      data,
      metadata
    );
  }
}
