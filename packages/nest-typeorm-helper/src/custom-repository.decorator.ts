import { SetMetadata } from '@nestjs/common';

import { getCustomRepositoryToken } from './token.util.js';

export function CustomRepository(
  entity: new (...args: any) => any,
): ClassDecorator {
  return SetMetadata(getCustomRepositoryToken(), entity);
}
