import { ProxyOptions } from './proxy-options.interface.js';

export interface PassOptions extends Omit<ProxyOptions, 'target'> {
  target: URL;
}
