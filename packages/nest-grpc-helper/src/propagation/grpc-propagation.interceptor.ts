import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { from, lastValueFrom, Observable } from 'rxjs';

import { propagationContext } from './propagation-context.js';

export class GrpcPropagationInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const rpc = context.switchToRpc();

    const metadata = rpc.getContext().getMap();

    return propagationContext.run({ headers: metadata }, () => {
      return from(lastValueFrom(next.handle()));
    });
  }
}
