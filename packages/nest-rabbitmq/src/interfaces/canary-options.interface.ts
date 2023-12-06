import { CanaryStrategy } from '../enums/canary-strategy.enum.js';

export type CanaryOptions = {
  enabled: boolean;
  isCanary: boolean;
} & (
  | {
      strategy: CanaryStrategy.Requeue;
      canaryHeaders: string[];
    }
  | {
      strategy: CanaryStrategy.CanaryQueue;
    }
);
