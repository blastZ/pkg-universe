import http from 'node:http';

import { PassOptions } from '../interfaces/pass-options.interface.js';
import { Proxy } from '../proxy.js';
import { getRewriteCookieConfig } from '../utils/get-rewrite-cookie-config.util.js';
import { getRewroteCookie } from '../utils/get-rewrote-cookie.util.js';

export function writeHeaders(
  proxy: Proxy,
  req: http.IncomingMessage,
  res: http.ServerResponse,
  proxyRes: http.IncomingMessage,
  passOptions: PassOptions,
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

  const rewriteCookieConfig = getRewriteCookieConfig(passOptions);

  Object.keys(headers).map((key) => {
    let value = headers[key];

    if (value) {
      if (key.toLowerCase() === 'set-cookie') {
        value = getRewroteCookie(String(value), rewriteCookieConfig);
      }

      res.setHeader(key, value);
    }
  });
}
