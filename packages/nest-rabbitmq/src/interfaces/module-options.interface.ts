import { AmqpConnectionManagerOptions } from 'amqp-connection-manager';

import { CanaryOptions } from './canary-options.interface.js';
import { PropagationOptions } from './propagation-options.interface.js';
import { TraceOptions } from './trace-options.interface.js';

export interface ModuleOptions {
  urls: string[];
  connectionManagerOptions?: AmqpConnectionManagerOptions;
  trace?: TraceOptions;
  propagation?: PropagationOptions;
  canary?: CanaryOptions;
  onError?: (err: unknown) => void;
}
