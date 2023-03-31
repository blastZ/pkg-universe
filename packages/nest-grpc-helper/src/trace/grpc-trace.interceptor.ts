import { logger } from '@blastz/logger';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import {
  catchError,
  from,
  lastValueFrom,
  Observable,
  tap,
  throwError,
} from 'rxjs';
import { traceContext } from './trace-context.js';

export class GrpcTraceInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const rpc = context.switchToRpc();

    const data = rpc.getData();
    const metadata = rpc.getContext().getMap();

    return traceContext.run({ requestId: metadata['x-request-id'] }, () => {
      const startTime = process.hrtime.bigint();

      logger
        .child({
          metadata,
          reqUrl: `/${context.getClass().name}/${context.getHandler().name}`,
          reqBody: data,
        })
        .trace('grpc request in');

      return from(
        lastValueFrom(
          next.handle().pipe(
            tap(() => {
              const endTime = process.hrtime.bigint();
              const duration =
                (endTime - startTime) / BigInt(1000) / BigInt(1000);

              logger
                .child({
                  resTime: `${duration}ms`,
                })
                .trace('grpc request out');
            }),
            catchError((err) => {
              logger.child({ error: err }).error('grpc request end by error');

              return throwError(() => err);
            }),
          ),
        ),
      );
    });
  }
}
