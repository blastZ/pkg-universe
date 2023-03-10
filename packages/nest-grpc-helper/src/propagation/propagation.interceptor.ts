import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { lastValueFrom, Observable } from 'rxjs';
import { propagationContext } from './context';

export class PropagationInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> | Promise<Observable<any>> {
    const rpc = context.switchToRpc();

    const meta = rpc.getContext();

    const map = meta.getMap();

    return propagationContext.run({ headers: map }, () => {
      return lastValueFrom(next.handle());
    });
  }
}
