import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, from, lastValueFrom } from 'rxjs';

import { Request } from 'express';
import { propagationContext } from './propagation-context.js';

export class PropagationInterceptor implements NestInterceptor {
  private getHttpHeaders(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();

    return request.headers;
  }

  private getWsHeaders(context: ExecutionContext) {
    const host = context.switchToWs();
    const socket = host.getClient();
    const data = host.getData();

    const headers = socket.handshake.headers;

    if (data?.headers) {
      return {
        ...headers,
        ...data.headers,
      };
    }

    return headers;
  }

  private getRpcHeaders(context: ExecutionContext) {
    const rpc = context.switchToRpc();

    const metadata = rpc.getContext().getMap();

    return metadata;
  }

  private getHeaders(context: ExecutionContext) {
    const type = context.getType();

    if (type === 'http') {
      return this.getHttpHeaders(context);
    }

    if (type === 'ws') {
      return this.getWsHeaders(context);
    }

    if (type === 'rpc') {
      return this.getRpcHeaders(context);
    }

    return {};
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return propagationContext.run({ headers: this.getHeaders(context) }, () => {
      return from(lastValueFrom(next.handle()));
    });
  }
}
