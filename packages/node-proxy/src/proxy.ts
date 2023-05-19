import EventEmitter from 'node:events';
import http from 'node:http';
import https from 'node:https';

import { stream } from './incoming-handles/stream.js';
import { PassOptions } from './interfaces/pass-options.interface.js';
import { ProxyOptions } from './interfaces/proxy-options.interface.js';

export class Proxy extends EventEmitter {
  private options: ProxyOptions;

  pass: http.RequestListener;

  constructor(options: ProxyOptions) {
    super();

    this.options = options;

    this.pass = this.createPass();
  }

  createPass(): http.RequestListener {
    return function pass(
      this: Proxy,
      req,
      res,
      options: ProxyOptions = this.options,
    ) {
      const handles = [stream];

      const { target, ...reset } = options;

      if (!target) {
        throw new Error('Invalid target value');
      }

      const passOptions: PassOptions = {
        ...reset,
        target: new URL(target),
      };

      handles.map((handle) => {
        handle(this, req, res, passOptions);
      });
    };
  }

  createServer() {
    const server = this.options.ssl
      ? https.createServer(this.options.ssl, (req, res) => {
          this.pass(req, res);
        })
      : http.createServer((req, res) => {
          this.pass(req, res);
        });

    return server;
  }
}
