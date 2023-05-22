import http from 'node:http';
import https from 'node:https';

export interface ProxyOptions {
  target?: string; // target server url
  ssl?: https.ServerOptions; // passed to https.createServer(ssl)
  proxyReqOptsDecorator?: (
    proxyReqOpts: https.RequestOptions,
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ) => https.RequestOptions;
  preserveHeaderKeyCase?: boolean; // default is false
  agent?: http.Agent | https.Agent | boolean; // default is false
  cookieDomainRewrite?: Record<string, string> | string; // default is undefined
  cookiePathRewrite?: Record<string, string> | string; // default is undefined
}
