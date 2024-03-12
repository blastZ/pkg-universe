import Joi from 'joi';
import request from 'supertest';

import nico from '../src/index.js';

import createControler from './api/controllers/create.js';
import getController from './api/controllers/get.js';

beforeAll(async () => {
  nico.init({
    routes: {
      'GET /user': {
        controller: getController,
        policies: true,
      },
      'POST /user': {
        controller: createControler,
        bodyParser: true,
        validate: {
          body: Joi.object({
            name: Joi.string().trim().required(),
          }),
        },
      },

      'GET /controllers': {
        controller: [
          async (ctx, next) => {
            await next();
            return ctx.ok(ctx.state.name);
          },
          async (ctx) => {
            ctx.state.name = 'test-controllers';
          },
        ],
      },
    },
    responses: {
      ok: function ok(data, message, success) {
        this.body = {
          success,
          data,
          message,
        };
      },
      onValidateError: function handle(err) {
        this.body = {
          success: false,
          message: err.message,
        };
      },
    },
  });
});

test('App', async () => {
  const createUser = await request(nico.callback())
    .post('/user')
    .send({ name: 'nico nico ni' });
  const getUsers = await request(nico.callback()).get('/user');
  const testControllers = await request(nico.callback()).get('/controllers');

  expect(createUser.body.data.name).toEqual('nico nico ni');
  expect(getUsers.body.data[0].name).toEqual('nico nico ni');
  expect(testControllers.body.data).toEqual('test-controllers');
});

test('Private Attributes', () => {
  expect(nico.initialed).toEqual(true);

  expect(() => {
    (nico as any).initialed = false;
  }).toThrowError();

  expect(nico.initialed).toEqual(true);

  expect(() => ((nico.config as any).custom = {})).toThrowError();
});
