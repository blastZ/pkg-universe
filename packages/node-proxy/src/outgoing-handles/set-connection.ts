import http from 'node:http';

import { Proxy } from '../proxy.js';

export function setConnection(
  proxy: Proxy,
  req: http.IncomingMessage,
  res: http.ServerResponse,
  proxyRes: http.IncomingMessage,
  passOptions: any,
) {
  console.log('outgoing/setConnection', {
    'req.httpVersion': req.httpVersion,
    'req.headers': req.headers,
    'proxyRes.headers': proxyRes.headers,
  });

  // Http 1.0
  if (req.httpVersion === '1.0') {
    // origin => (1.0) => proxy => (1.1) => target
    return (proxyRes.headers.connection = req.headers.connection || 'close');
  }

  // Http 1.1 and above
  if (proxyRes.headers.connection) {
    return;
  }

  if (req.headers.connection) {
    return (proxyRes.headers.connection = req.headers.connection);
  }

  if (req.httpVersion === '1.1') {
    return (proxyRes.headers.connection = 'keep-alive');
  }
}
