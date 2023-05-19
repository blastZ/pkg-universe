import http from 'node:http';

import { Proxy } from '../proxy.js';

export function writeHeaders(
  proxy: Proxy,
  req: http.IncomingMessage,
  res: http.ServerResponse,
  proxyRes: http.IncomingMessage,
  passOptions: any,
) {
  let headers = proxyRes.headers;

  if (passOptions.preserveHeaderKeyCase && proxyRes.rawHeaders) {
    headers = {};

    const rawHeaders = proxyRes.rawHeaders;

    for (let i = 0; i < rawHeaders.length; i += 2) {
      const key = rawHeaders[i];
      const value = rawHeaders[i + 1];

      headers[key] = value;
    }
  }

  Object.keys(headers).map((key) => {
    const value = headers[key];

    // TODO rewrite cookie domain
    // TODO rewrite cookie path

    if (value) {
      res.setHeader(key, value);
    }
  });
}
