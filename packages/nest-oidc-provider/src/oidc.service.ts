import { Injectable } from '@nestjs/common';
import { IncomingMessage, ServerResponse } from 'node:http';
import Provider, { KoaContextWithOIDC } from 'oidc-provider';

@Injectable()
export class OidcService {
  constructor(private provider: Provider) {}

  getProvider() {
    return this.provider;
  }

  getContext(req: IncomingMessage, res: ServerResponse) {
    const ctx = this.provider.app.createContext(req, res) as KoaContextWithOIDC;

    Object.defineProperty(ctx, 'oidc', {
      value: new this.provider.OIDCContext(ctx),
    });

    return ctx;
  }

  async getSession(req: IncomingMessage, res: ServerResponse) {
    const context = this.getContext(req, res);

    const session = await this.provider.Session.get(context);

    return session;
  }
}
