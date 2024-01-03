import './init-env.js';

import { inject } from '../src/index.esm.js';

test('inject object without global config', () => {
  type MongoConfig = {
    host: string;
    port: number;
  };

  const mongoConfig = inject<MongoConfig>('mongo', {
    host: 'localhost',
    port: 1234,
  });

  expect(mongoConfig.host).toEqual('localhost');
  expect(mongoConfig.port).toEqual(1234);
});

test('inject object with global config', () => {
  type LoggerConfig = {
    consoleLevel: string;
  };

  const loggerConfig = inject<LoggerConfig>('logger', {
    consoleLevel: 'info',
  });

  expect(loggerConfig.consoleLevel).toEqual('error');

  type RedisConfig = {
    host: string;
    port: number;
  };

  const redisConfig = inject<RedisConfig>('redis', {
    host: 'localhost',
    port: 6379,
  });

  expect(redisConfig.host).toEqual('localhost');
  expect(redisConfig.port).toEqual(5252);
});

test('inject array without global config', () => {
  type ProxyConfig = {
    target: string;
  };

  const proxiesConfig = inject<ProxyConfig[]>('proxies', [], {
    arrayMerge: (_, sourceArray) => sourceArray,
  });

  expect(Array.isArray(proxiesConfig)).toEqual(true);

  const proxiesConfig2 = inject<ProxyConfig[]>('proxies', [
    { target: 'localhost' },
  ]);

  expect(Array.isArray(proxiesConfig2)).toEqual(true);
  expect(proxiesConfig2[0].target).toEqual('localhost');
});

test('inject array with global config', () => {
  type WsProxyConfig = {
    target: string;
  };

  const proxiesConfig = inject<WsProxyConfig[]>(
    'wsProxies',
    [{ target: 'localhost' }],
    {
      arrayMerge: (_, sourceArray) => sourceArray,
    },
  );

  expect(Array.isArray(proxiesConfig)).toEqual(true);
  expect(proxiesConfig[0].target).toEqual('127.0.0.1');

  const proxiesConfig2 = inject<WsProxyConfig[]>('wsProxies', [
    { target: 'localhost' },
  ]);

  expect(Array.isArray(proxiesConfig)).toEqual(true);
  expect(proxiesConfig2[0].target).toEqual('localhost');
  expect(proxiesConfig2[1].target).toEqual('127.0.0.1');
});
