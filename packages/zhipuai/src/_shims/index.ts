import { getRuntime } from './node-runtime.js';
import * as shims from './registry.js';

if (!shims.kind) {
  shims.setShims(getRuntime());
}

export * from './registry.js';
