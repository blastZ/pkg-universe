import { Inject } from '@nestjs/common';

import { serviceProxyToken } from './service-proxy-token.util.js';

export function ServiceProxyDec(
  packageName: string,
  serviceName: string,
): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    Inject(serviceProxyToken(packageName, serviceName))(
      target,
      propertyKey,
      parameterIndex,
    );
  };
}
