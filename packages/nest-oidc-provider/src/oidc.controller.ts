import { All, Controller, Inject, Req, Res } from '@nestjs/common';
import { type Request, type Response } from 'express';
import Provider from 'oidc-provider';

import { OIDC_CONFIG, OidcConfig } from './oidc.config.js';

@Controller('oidc')
export class OidcController {
  path: string;
  callback: (req: Request, res: Response) => void;

  constructor(
    private provider: Provider,
    @Inject(OIDC_CONFIG) config: OidcConfig,
  ) {
    this.callback = this.provider.callback();
    this.path = config.path || '/oidc';
  }

  @All('/*')
  mountedOidc(@Req() req: Request, @Res() res: Response) {
    req.url = req.originalUrl.replace(this.path, '');

    return this.callback(req, res);
  }
}
