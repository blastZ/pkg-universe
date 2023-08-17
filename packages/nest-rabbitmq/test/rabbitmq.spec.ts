import { Test } from '@nestjs/testing';
import { RabbitMQModule, RabbitMQService } from '../src/index.js';

describe('RabbitMQModule', () => {
  let rabbitmq: RabbitMQService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RabbitMQModule.forRoot({
          urls: ['amqp://guest:guest@localhost:5672'],
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
