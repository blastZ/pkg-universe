export {
  type AmqpConnectionManager,
  type ChannelWrapper,
} from 'amqp-connection-manager';
export { type Channel, type ConsumeMessage } from 'amqplib';

export * from './rabbitmq.module.js';
export * from './rabbitmq.service.js';

export * from './connection-manager.decorator.js';
export * from './token.js';

export * from './enums/canary-strategy.enum.js';
export * from './enums/channel-event.enum.js';
export * from './enums/connection-event.enum.js';

export * from './interfaces/canary-options.interface.js';
export * from './interfaces/module-options.interface.js';
export * from './interfaces/propagation-options.interface.js';
export * from './interfaces/trace-options.interface.js';
