import { AmqpConnectionManagerOptions } from 'amqp-connection-manager';

import { CanaryOptions } from './canary-options.interface.js';
import { PropagationOptions } from './propagation-options.interface.js';
import { TraceOptions } from './trace-options.interface.js';

export interface ModuleOptions {
  urls: string[];
  connectionManagerOptions?: AmqpConnectionManagerOptions;
  json?: boolean; // default is true
  trace?: TraceOptions;
  propagation?: PropagationOptions;
  canary?: CanaryOptions;
  onError?: (err: unknown) => void;
  messageContentLengthLimit?: number; // bytes, default is unlimited
  compress?: {
    enabled: boolean;
    minLength?: number; // bytes, default is 1 * 1024
  };
}
