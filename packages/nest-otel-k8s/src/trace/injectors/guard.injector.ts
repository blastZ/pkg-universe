import { CanActivate, Injectable } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';

import { EnhancerInjector, EnhancerType } from './enhancer.injector.js';

@Injectable()
export class GuardInjector extends EnhancerInjector<CanActivate> {
  constructor(modulesContainer: ModulesContainer) {
    super(modulesContainer, EnhancerType.GUARD);
  }
}
