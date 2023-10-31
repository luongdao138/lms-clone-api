import { RabbitMQExchangeConfig } from '@golevelup/nestjs-rabbitmq';

export const DEFAULT_CHANNEL = 'LMS_CLONE_DEFAULT';

export enum QUEUE_NAME {
  ALERT = 'alert',
}

export enum EXCHANGE_TYPE {
  TOPIC = 'topic',
  DIRECT = 'direct',
  FANOUT = 'fanout',
  HEADERS = 'headers',
}

// we only use one exchange for now
export enum EXCHANGE_NAME {
  LMS_EVENT_BUS = 'lms_event_bus',
  PUBSUB = 'pubsub',
  FALLBACK = 'fallback',
}

export const exchanges: RabbitMQExchangeConfig[] = [
  {
    name: EXCHANGE_NAME.LMS_EVENT_BUS,
    type: EXCHANGE_TYPE.TOPIC,
    options: {
      alternateExchange: EXCHANGE_NAME.FALLBACK,
    },
  },
  {
    name: EXCHANGE_NAME.PUBSUB,
    type: EXCHANGE_TYPE.FANOUT,
  },
  {
    name: EXCHANGE_NAME.FALLBACK,
    type: EXCHANGE_TYPE.FANOUT,
  },
];

export const DEFAULT_EXPIRATION = 10000; // 1 hour
