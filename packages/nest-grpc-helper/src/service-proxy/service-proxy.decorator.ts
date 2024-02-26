import { Inject } from '@nestjs/common';

import { serviceProxyToken } from './service-proxy-token.util.js';

export function ServiceProxyDec(packageName: string, serviceName: string) {
  return Inject(serviceProxyToken(packageName, serviceName));
}
