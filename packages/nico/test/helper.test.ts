import request from 'supertest';

import { Nico } from '../src/index.js';

const nico = new Nico();
const req = request(nico.callback());

beforeAll(() => {
  nico.init({
    routes: {
      'GET /getExecuteTime': {
        controller: async (ctx) => {
          const start = ctx.helper.getExecuteTime();
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve(1);
            }, 600);
          });
          const end = ctx.helper.getExecuteTime();
          return (ctx.body = { time: end - start });
        },
      },
    },
  });
});

test('getExecuteTime', async () => {
  const { time } = (await req.get('/getExecuteTime')).body;
  expect(Math.abs(Math.round(time / 1000 - 0.6))).toEqual(0);
});
