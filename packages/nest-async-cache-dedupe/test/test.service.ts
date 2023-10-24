import { Injectable } from '@nestjs/common';

import { AsyncCacheDedupe } from '../src/index.js';

@Injectable()
export class TestService {
  private myName: string;

  constructor() {
    this.myName = 'haha';
  }

  @AsyncCacheDedupe({
    ttl: 5,
  })
  async run(name: string, age: number) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('name: ', name);
    console.log('age: ', age);
    console.log('myName: ', this.myName);

    console.log('done');

    return true;
  }

  @AsyncCacheDedupe({
    ttl: 5,
  })
  async runWithObj(options: { name: string; age: number }) {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('name: ', options.name);
    console.log('age: ', options.age);
    console.log('myName: ', this.myName);

    console.log('done');

    return true;
  }
}
