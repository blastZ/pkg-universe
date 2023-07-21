import { Metadata } from '@grpc/grpc-js';
import { InternalServerErrorException } from '@nestjs/common';
import {
  catchError,
  lastValueFrom,
  map,
  Observable,
  retry,
  throwError,
  timeout,
} from 'rxjs';

import { GrpcClientOptions } from '../grpc-clients/index.js';
import { GrpcReply } from '../grpc-common/index.js';
import { COMMON_PROPAGATION_HEADERS } from './common-propagation-headers.constant.js';
import { SendOptions } from './interfaces/send-options.interface.js';

export class ServiceProxy {
  constructor(
    private serviceName: string,
    private service: any,
    private options: GrpcClientOptions,
  ) {}

  private getMetadata(meta?: Record<string, string | Buffer>) {
    const metadata = new Metadata();

    if (meta) {
      Object.keys(meta).map((key) => {
        metadata.add(key, meta[key]);
      });
    }

    if (!this.options.propagation) {
      return metadata;
    }

    const store = this.options.propagation.context.getStore();

    if (!store) {
      return metadata;
    }

    const propagationHeaders = COMMON_PROPAGATION_HEADERS.concat(
      this.options.propagation.headers || [],
    );

    propagationHeaders.map((key) => {
      const value = store.headers[key];

      if (value) {
        metadata.add(key, String(value));
      }
    });

    return metadata;
  }

  send<T1 = any, T2 = any>(
    method: string,
    data: T1,
    options?: SendOptions,
  ): Observable<T2> {
    const metadata = this.getMetadata(options?.meta);

    if (!this.service[method]) {
      throw new InternalServerErrorException('ERR_SERVICE_METHOD_NOT_FOUND');
    }

    return this.service[method](data, metadata).pipe(
      map((reply: GrpcReply) => {
        if (Array.isArray(reply.data)) {
          if (!reply.data[0]['@type']) {
            return reply;
          }

          const { data, ...other } = reply;

          return {
            data: data.map(({ ['@type']: _, ...o }) => o),
            ...other,
          };
        }

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
            () => new InternalServerErrorException('ERR_GRPC_REQUEST_TIMEOUT'),
          ),
      }),
      retry({
        count: options?.retryCount ?? this.options.retryCount ?? 3,
        delay: options?.retryDelay ?? this.options.retryDelay ?? 600,
      }),
      catchError((err) => {
        return throwError(
          () =>
            new InternalServerErrorException({
              message: `ERR_SEND_REQUEST: send request "${this.options.packageName}.${this.serviceName}.${method}" failed`,
              code: 500,
              cause: err,
            }),
        );
      }),
    );
  }

  async pSend<T1 = any, T2 = any>(
    method: string,
    data: T1,
    options?: SendOptions,
  ): Promise<T2> {
    return lastValueFrom(this.send(method, data, options));
  }
}
