import { ExceptionFilter, Injectable } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';

import { EnhancerInjector, EnhancerType } from './enhancer.injector.js';

@Injectable()
export class ExceptionFilterInjector extends EnhancerInjector<ExceptionFilter> {
  constructor(modulesContainer: ModulesContainer) {
    super(modulesContainer, EnhancerType.FILTER);
  }
}
