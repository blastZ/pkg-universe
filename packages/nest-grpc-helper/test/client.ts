import { Injectable } from '@nestjs/common';

import { ServiceProxy, ServiceProxyDec } from '../src/index.js';

@Injectable()
export class UsersService {
  constructor(
    @ServiceProxyDec('accountManager', 'UsersService')
    private client: ServiceProxy,
  ) {}

  async createUser(params: { name: string; email: string }) {
    const { data: user } = await this.client
      .pSend('createUser', params)
      .catch((err) => {
        console.error(err);
      });

    return user;
  }
}
