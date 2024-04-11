# Nest RabbitMQ

## Getting started

Install nest-rabbitmq

```bash
npm install @blastz/nest-rabbitmq
```

## Examples

Register module

```ts
import {
  RabbitMQModule,
  RabbitMQService,
  ConnectionEvent,
} from '@blastz/nest-rabbitmq';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      urls: ['...'],
    }),
  ],
  // ...
})
export class AppModule implements OnModuleInit {
  constructor(private rabbitmq: RabbitMQService) {}

  onModuleInit() {
    this.rabbitmq.addListener(ConnectionEvent.ConnectFailed, ({ err }) => {
      // handle connect error
    });

    this.rabbitmq.addListener(ConnectionEvent.Disconnect, ({ err }) => {
      // handle disconnect error
    });
  }

  // ...
}
```

Create channel

```ts
import {
  Channel,
  ChannelEvent,
  ChannelWrapper,
  RabbitMQService,
} from '@blastz/nest-rabbitmq';

export class AppController implements OnModuleInit {
  private channel: ChannelWrapper;

  constructor(private rabbitmq: RabbitMQService) {}

  async onModuleInit() {
    this.channel = this.rabbitmq.createChannel({});

    await this.channel.addSetup((channel: Channel) => {
      return Promise.all([
        channel.assertExchange('amq.direct', 'direct'),
        channel.assertQueue('q-1'),
        channel.bindQueue('q-1', 'amq.direct', 'test'),
      ]);
    });

    this.channel.on(ChannelEvent.Error, (err) => {
      // handle channel setup error
    });
  }

  // ...
}
```

Enable canary feature

```ts
import { CanaryStrategy, RabbitMQModule } from '@blastz/nest-rabbitmq';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      canary: {
        enabled: true,
        strategy: CanaryStrategy.CanaryQueue,
        isCanary: true, // set to true for canary pod
      },
    }),
  ],
})
export class AppModule {}
```

Enable message compression

```ts
import { RabbitMQModule } from '@blastz/nest-rabbitmq';

@Module({
  imports: [
    RabbitMQModule.forRoot({
      compress: {
        enabled: true,
      },
    }),
  ],
})
export class AppModule {}
```

## Packed Objects

### ChannelWrapper

packed methods list:

- addSetup
- assertQueue
- assertExchange
- bindQueue
- consume
- sendToQueue
- publish

### Channel

packed methods list:

- assertQueue
- assertExchange
- bindQueue
- consume

## License

Licensed under MIT
