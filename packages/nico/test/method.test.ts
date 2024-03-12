import request from 'supertest';

import { Nico } from '../src/index.js';

test('startCluster', () => {
  const nico = new Nico();

  expect(typeof nico.startCluster).toEqual('function'); // TODO test cluster mode
});

test('useAppMiddleware', async () => {
  const nico = new Nico();

  nico.useAppMiddleware(async function customMiddleware(ctx, next) {
    await next();
    ctx.set('custom', 'custom');
  });

  nico.useAppMiddleware(async function customMiddleware2(ctx, next) {
    await next();
    ctx.set('custom2', 'custom2');
  }, 'custom');

  nico.init({
    routes: {
      '/test': {
        GET: {
          controller: (ctx) => {
            ctx.body = { text: 'test' };
          },
        },
      },
    },
  });

  const req = request(nico.callback());

  const result = await req.get('/test');

  expect(result.header.custom).toEqual('custom');
  expect(result.header.custom2).toEqual('custom2');
});

test('useRouteMiddleware', async () => {
  const nico = new Nico();

  nico.useRouteMiddleware(async function customMiddleware(ctx, next) {
    await next();
    ctx.set('custom', 'custom');
  });

  nico.useRouteMiddleware(async function customMiddleware2(ctx, next) {
    await next();
    ctx.set('custom2', 'custom2');
  }, 'custom');

  nico.init({
    routes: {
      '/test': {
        GET: {
          controller: (ctx) => {
            ctx.body = { text: 'test' };
          },
        },
      },
    },
  });

  const req = request(nico.callback());
  const result = await req.get('/test');

  expect(result.header.custom).toEqual('custom');
  expect(result.header.custom2).toEqual('custom2');
});

test('setCustom', async () => {
  const nico = new Nico();

  const dbUrl = 'mysql://root:admin123@localhost:3306/test';
  const cacheUrl = 'redis://localhost:6379';

  nico.setCustom({
    datastores: {
      default: {
        url: dbUrl,
      },
    },
  });

  expect(nico.custom.datastores.default.url).toEqual(dbUrl);

  nico.setCustom({
    datastores: {
      cache: {
        url: cacheUrl,
      },
    },
  });

  expect(nico.custom.datastores.default.url).toEqual(dbUrl);
  expect(nico.custom.datastores.cache.url).toEqual(cacheUrl);

  nico.custom.datastores.default = {};
  expect(nico.custom.datastores.default.url).toEqual(dbUrl);
});
