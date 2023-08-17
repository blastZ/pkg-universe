import { Inject } from '@nestjs/common';

import { CONNECTION_MANAGER } from './token.js';

export function ConnectionManager() {
  return Inject(CONNECTION_MANAGER);
}
