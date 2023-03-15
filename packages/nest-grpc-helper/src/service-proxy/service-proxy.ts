import { Metadata } from '@grpc/grpc-js';
import { InternalServerErrorException } from '@nestjs/common';
import {
  lastValueFrom,
  map,
  Observable,
  retry,
  throwError,
  timeout,
} from 'rxjs';

import { GrpcClientOptions } from '../grpc-clients/index.js';
import { GrpcReply } from '../grpc-common/index.js';
import { propagationContext } from '../propagation/index.js';
import { SendOptions } from './interfaces/send-options.interface.js';

export class ServiceProxy {
  constructor(private service: any, private options: GrpcClientOptions) {}

  private getMetadata(meta?: Record<string, string | Buffer>) {
    const metadata = new Metadata();

    if (this.options.propagationHeaders) {
      const propagation = propagationContext.getStore();

      if (propagation) {
        this.options.propagationHeaders.map((key) => {
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

  send<T1 = any, T2 = any>(
    method: string,
    data: T1,
    options?: SendOptions
  ): Observable<T2> {
    const metadata = this.getMetadata(options?.meta);

    if (!this.service[method]) {
      throw new InternalServerErrorException('ERR_SERVICE_METHOD_NOT_FOUND');
    }

    return this.service[method](data, metadata).pipe(
      map((reply: GrpcReply) => {
        if (!reply.data || !reply.data['@type']) {
          return reply;
        }

        const {
          data: { ['@type']: _, ...data },
          ...other
        } = reply;

        return {
          data,
          ...other,
        };
      }),
      timeout({
        first: options?.timeout ?? this.options.timeout ?? 3000,
        with: () =>
          throwError(
            () => new InternalServerErrorException('ERR_GRPC_REQUEST_TIMEOUT')
          ),
      }),
      retry({
        count: options?.retryCount ?? this.options.retryCount ?? 3,
        delay: options?.retryDelay ?? this.options.retryDelay ?? 0,
      })
    );
  }

  pSend<T1 = any, T2 = any>(
    method: string,
    data: T1,
    options?: SendOptions
  ): Promise<T2> {
    return lastValueFrom(this.send(method, data, options));
  }
}
