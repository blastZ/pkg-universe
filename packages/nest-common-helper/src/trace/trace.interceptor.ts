import { logger } from '@blastz/logger';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import {
  Observable,
  catchError,
  from,
  lastValueFrom,
  tap,
  throwError,
} from 'rxjs';
import { v4 as uuid } from 'uuid';

import { StandardException } from '../exception/standard.exception.js';
import { traceContext } from './trace-context.js';

const REQUEST_ID_HEADER = 'x-request-id';

export class TraceInterceptor implements NestInterceptor {
  private getRequestUrl(context: ExecutionContext) {
    return `/${context.getClass().name}/${context.getHandler().name}`;
  }

  private getHttpRequestMetadata(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    const reqUrl = this.getRequestUrl(context);

    return {
      reqType: 'http',
      reqMethod: req.method,
      reqUrl,
      reqBody: req.body,
      reqIp: req.ip,
      reqIps: req.ips,
      referer: req.headers.referer,
      userAgent: req.headers['user-agent'],
    };
  }

  private getWsRequestMetadata(context: ExecutionContext) {
    const socketHost = context.switchToWs();

    const reqUrl = this.getRequestUrl(context);
    const data = socketHost.getData();

    return {
      reqType: 'ws',
      reqUrl,
      reqBody: data,
    };
  }

  private getRpcRequestMetadata(context: ExecutionContext) {
    const rpc = context.switchToRpc();

    const reqUrl = this.getRequestUrl(context);
    const data = rpc.getData();
    const metadata = rpc.getContext().getMap();

    return {
      reqType: 'rpc',
      reqUrl,
      reqBody: data,
      metadata,
    };
  }

  private getRequestMetadata(context: ExecutionContext) {
    const type = context.getType();

    if (type === 'http') {
      return this.getHttpRequestMetadata(context);
    }

    if (type === 'ws') {
      return this.getWsRequestMetadata(context);
    }

    if (type === 'rpc') {
      return this.getRpcRequestMetadata(context);
    }

    return {};
  }

  private getRequestId(context: ExecutionContext) {
    const type = context.getType();

    if (type === 'http') {
      const req = context.switchToHttp().getRequest();
      const res = context.switchToHttp().getResponse();

      if (!req.headers[REQUEST_ID_HEADER]) {
        req.headers[REQUEST_ID_HEADER] = uuid();
      }

      const requestId = req.headers[REQUEST_ID_HEADER];

      res.setHeader(REQUEST_ID_HEADER, requestId);

      return requestId;
    }

    if (type === 'ws') {
      const data = context.switchToWs().getData();

      const requestId = data?.headers?.[REQUEST_ID_HEADER] || uuid();

      return requestId;
    }

    if (type === 'rpc') {
      const metadata = context.switchToRpc().getContext().getMap();

      const requestId = metadata[REQUEST_ID_HEADER] || uuid();

      return requestId;
    }

    return uuid();
  }

  private getResTime(startTime: bigint) {
    const endTime = process.hrtime.bigint();
    const duration = (endTime - startTime) / BigInt(1000) / BigInt(1000);

    return `${duration}ms`;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const requestMetadata = this.getRequestMetadata(context);
    const requestId = this.getRequestId(context);

    return traceContext.run({ requestId }, () => {
      const startTime = process.hrtime.bigint();

      logger.child(requestMetadata).trace('request in');

      return from(
        lastValueFrom(
          next.handle().pipe(
            tap(() => {
              const resTime = this.getResTime(startTime);

              logger
                .child({
                  resTime,
                })
                .trace('request out');
            }),
            catchError((err) => {
              const resTime = this.getResTime(startTime);

              logger
                .child({
                  resTime,
                  error: err,
                })
                .error('request end by error');

              if (context.getType() === 'ws') {
                if (err instanceof StandardException) {
                  const response = err.getResponse() as any;

                  if (response.meta) {
                    response.meta.requestId = requestId;
                  } else {
                    response.meta = {
                      requestId,
                    };
                  }

                  return throwError(() => new StandardException(response));
                }
              }

              return throwError(() => err);
            }),
          ),
        ),
      );
    });
  }
}
