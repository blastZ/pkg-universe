import http from 'node:http';
import https from 'node:https';

import { PassOptions } from '../interfaces/pass-options.interface.js';
import { setConnection } from '../outgoing-handles/set-connection.js';
import { writeHeaders } from '../outgoing-handles/write-headers.js';
import { Proxy } from '../proxy.js';

const isSsl = /^https|wss/;

export function stream(
  proxy: Proxy,
  req: http.IncomingMessage,
  res: http.ServerResponse,
  passOptions: PassOptions,
) {
  proxy.emit('start', req, res, passOptions.target);

  const agent = passOptions.target.protocol === 'https:' ? https : http;

  let proxyReqOpts: https.RequestOptions = {
    host: passOptions.target.host,
    hostname: passOptions.target.hostname,
    port:
      passOptions.target.port ||
      (isSsl.test(passOptions.target.protocol) ? 443 : 80),
    method: req.method,
    path: req.url,
    headers: req.headers,
    agent: passOptions.agent || false,
  };

  if (passOptions.proxyReqOptsDecorator) {
    proxyReqOpts = passOptions.proxyReqOptsDecorator(proxyReqOpts, req, res);
  }

  const proxyReq = agent.request(proxyReqOpts);

  req.pipe(proxyReq);

  proxyReq.on('response', (proxyRes) => {
    const handles = [setConnection, writeHeaders];

    handles.map((handle) => {
      handle(proxy, req, res, proxyRes, passOptions);
    });

    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.log('error: ', err);
    console.log('isDestroyed: ', proxyReq.destroyed);

    throw err;
  });
}
