import KeepAliveAgent from 'agentkeepalive';
import fetch from 'node-fetch';

import type { Shims } from './registry.js';

const defaultHttpAgent = new KeepAliveAgent({
  keepAlive: true,
  timeout: 5 * 60 * 1000,
});
const defaultHttpsAgent = new KeepAliveAgent.HttpsAgent({
  keepAlive: true,
  timeout: 5 * 60 * 1000,
});

export function getRuntime(): Shims {
  return {
    kind: 'node',
    fetch,
    getDefaultAgent: (url: string) =>
      url.startsWith('https') ? defaultHttpsAgent : defaultHttpAgent,
  };
}
