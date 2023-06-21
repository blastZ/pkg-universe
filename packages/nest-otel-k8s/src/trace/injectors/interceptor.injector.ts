import { Injectable, NestInterceptor } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';

import { EnhancerInjector, EnhancerType } from './enhancer.injector.js';

@Injectable()
export class InterceptorInjector extends EnhancerInjector<NestInterceptor> {
  constructor(modulesContainer: ModulesContainer) {
    super(modulesContainer, EnhancerType.INTERCEPTOR);
  }
}
