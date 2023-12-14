import { Test } from '@nestjs/testing';
import { RabbitMQModule, RabbitMQService } from '../src/index.js';

describe('RabbitMQModule', () => {
  let rabbitmq: RabbitMQService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RabbitMQModule.forRoot({
          urls: ['amqp://guest:guest@localhost:5672'],
          messageContentLengthLimit: 1 * 1024,
        }),
      ],
    }).compile();

    rabbitmq = moduleRef.get(RabbitMQService);
  });

  it('should send to queue', async () => {
    const channel = rabbitmq.createChannel();

    await channel.assertQueue('test');

    await channel.sendToQueue('test', { data: { total: 10 } });

    await channel.close();
    await rabbitmq.close();
  });

  it('should throw error when message content length is too long', async () => {
    const channel = rabbitmq.createChannel();

    await channel.assertQueue('test');

    await expect(
      channel.sendToQueue('test', {
        data: {
          total: 10,
        },
      }),
    ).resolves.not.toThrowError();

    await expect(
      channel.sendToQueue('test', {
        data: {
          total: 10,
          longString: 'a'.repeat(1024),
        },
      }),
    ).rejects.toThrowError();

    await channel.close();
    await rabbitmq.close();
  });

  it('should consume from queue', async () => {
    const channel = rabbitmq.createChannel();

    await channel.assertQueue('test');

    await new Promise((resolve) => {
      channel.consume('test', (msg) => {
        const data = JSON.parse(msg.content.toString());

        console.log(data);

        return resolve(data);
      });
    });

    await channel.close();
    await rabbitmq.close();
  });
});
