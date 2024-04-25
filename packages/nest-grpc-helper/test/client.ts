import { Injectable } from '@nestjs/common';

import { ServiceProxy, ServiceProxyDec, type GrpcReply } from '../src/index.js';

interface User {
  id: number;
  name: string;
}

@Injectable()
export class UsersService {
  constructor(
    @ServiceProxyDec('accountManager', 'UsersService')
    private client: ServiceProxy,
  ) {}

  async createUser(params: { name: string }) {
    const result = await this.client.pSend<any, GrpcReply<User>>(
      'createUser',
      params,
    );

    return result;
  }

  async listUsers(): Promise<GrpcReply<User[]>> {
    const result = await this.client.pSend('listUsers', {});

    return result;
  }
}
