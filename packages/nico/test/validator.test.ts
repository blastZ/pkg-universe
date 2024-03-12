import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { logger } from '@blastz/logger';
import Joi from 'joi';
import request from 'supertest';

import { Nico } from '../src/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

logger.silent = true;

test('query', async () => {
  const nico = new Nico();
  nico.init({
    routes: {
      'GET /users': {
        controller: async (ctx) => {
          return (ctx.body = { query: ctx.state.query });
        },
        bodyParser: true,
        validate: {
          query: Joi.object({
            limit: Joi.number().required().min(1),
          }).required(),
        },
      },
    },
  });

  const agent = request(nico.callback());
  const TEST_URL = '/users';

  const result = await agent.get(TEST_URL);
  expect(result.status).toEqual(400);
  expect(result.text).toEqual('"limit" is required');

  const result2 = await agent.get(`${TEST_URL}?limit=12`);
  expect(result2.status).toEqual(200);
  expect(result2.body.query.limit).toEqual(12);
});

test('params', async () => {
  const nico = new Nico();
  nico.init({
    routes: {
      'PATCH /users/:id': {
        controller: async (ctx) => {
          return (ctx.body = { params: ctx.state.params });
        },
        bodyParser: true,
        validate: {
          params: Joi.object({
            id: Joi.number().min(1).max(36),
          }).required(),
        },
      },
    },
  });

  const agent = request(nico.callback());

  const result = await agent.patch('/users/text');
  expect(result.status).toEqual(400);
  expect(result.text).toEqual('"id" must be a number');

  const result2 = await agent.patch('/users/2');
  expect(result2.status).toEqual(200);
  expect(result2.body.params.id).toEqual(2);
});

test('body', async () => {
  const nico = new Nico();
  nico.init({
    routes: {
      'POST /users': {
        controller: async (ctx) => {
          return (ctx.body = ctx.state.body);
        },
        bodyParser: true,
        validate: {
          body: Joi.object({
            name: Joi.string().required().trim().min(1).max(24),
          }).required(),
        },
      },
    },
  });

  const TEST_URL = '/users';
  const agent = request(nico.callback());

  const result = await agent.post(TEST_URL);
  expect(result.status).toEqual(400);
  expect(result.text).toEqual('"name" is required');

  const result2 = await agent.post(TEST_URL).send({ age: 12 });
  expect(result2.status).toEqual(400);
  expect(result2.text).toEqual('"name" is required');

  const result3 = await agent.post(TEST_URL).send({ name: 'test', age: 12 });
  expect(result3.status).toEqual(400);
  expect(result3.text).toEqual('"age" is not allowed');

  const result4 = await agent.post(TEST_URL).send({ name: 'test' });
  expect(result4.status).toEqual(200);
  expect(result4.body.name).toEqual('test');
});

test('files', async () => {
  const nico = new Nico();
  nico.init({
    routes: {
      'POST /assets': {
        controller: async (ctx) => {
          return (ctx.body = 'success');
        },
        bodyParser: {
          multipartOpts: {
            enable: true,
          },
        },
        validate: {
          files: {
            file: {
              type: Joi.string().valid('image/jpeg'),
            },
            'file2?': {
              type: Joi.string().valid('image/png'),
            },
            'file3?': {
              name: Joi.string().valid('avatar2.jpg'),
            },
            'file4?': {
              extname: Joi.string().valid('.jpeg'),
            },
            'file5?': {
              basename: Joi.string().valid('avatar2'),
            },
            'file6?': {
              size: Joi.number().max(5 * 1024),
            },
          },
        },
      },
    },
  });

  const TEST_URL = '/assets';
  const agent = request(nico.callback());

  const filePath = path.resolve(__dirname, './assets/avatar.jpg');

  const result = await agent.post(TEST_URL);
  expect(result.status).toEqual(400);
  expect(result.text).toEqual('"file" is required');

  const result2 = await agent
    .post(TEST_URL)
    .attach('file', filePath)
    .attach('file2', filePath);
  expect(result2.status).toEqual(400);
  expect(result2.text).toEqual('"value" must be [image/png]');

  const result3 = await agent
    .post(TEST_URL)
    .attach('file', filePath)
    .attach('file3', filePath);
  expect(result3.status).toEqual(400);
  expect(result3.text).toEqual('"value" must be [avatar2.jpg]');

  const result4 = await agent
    .post(TEST_URL)
    .attach('file', filePath)
    .attach('file4', filePath);
  expect(result4.status).toEqual(400);
  expect(result4.text).toEqual('"value" must be [.jpeg]');

  const result5 = await agent
    .post(TEST_URL)
    .attach('file', filePath)
    .attach('file5', filePath);
  expect(result5.status).toEqual(400);
  expect(result5.text).toEqual('"value" must be [avatar2]');

  const result6 = await agent
    .post(TEST_URL)
    .attach('file', filePath)
    .attach('file6', filePath);
  expect(result6.status).toEqual(400);
  expect(result6.text).toEqual('"value" must be less than or equal to 5120');
});
