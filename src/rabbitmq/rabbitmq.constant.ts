import { RabbitMQExchangeConfig } from '@golevelup/nestjs-rabbitmq';

export const DEFAULT_CHANNEL = 'LMS_CLONE_DEFAULT';

export enum EXCHANGE_TYPE {
  TOPIC = 'topic',
  DIRECT = 'direct',
  FANOUT = 'fanout',
  HEADERS = 'headers',
}

export enum EXCHANGE_NAME {
  EMAIL = 'email',
}

export enum QUEUE_NAME {
  EMAIL = 'email',
}

export enum BINDING_ROUTING_KEY {
  EMAIL = 'email:#',
}

export const exchanges: RabbitMQExchangeConfig[] = [
  {
    name: EXCHANGE_NAME.EMAIL,
    type: EXCHANGE_TYPE.TOPIC,
    options: {},
  },
];
