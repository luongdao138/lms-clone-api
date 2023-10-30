import { RabbitMQExchangeConfig } from '@golevelup/nestjs-rabbitmq';

export const DEFAULT_CHANNEL = 'LMS_CLONE_DEFAULT';

export enum EXCHANGE_TYPE {
  TOPIC = 'topic',
  DIRECT = 'direct',
  FANOUT = 'fanout',
  HEADERS = 'headers',
}

// we only use one exchange for now
export enum EXCHANGE_NAME {
  LMS_EVENT_BUS = 'lms_event_bus',
}

export const exchanges: RabbitMQExchangeConfig[] = [
  {
    name: EXCHANGE_NAME.LMS_EVENT_BUS,
    type: EXCHANGE_TYPE.TOPIC,
    options: {},
  },
];
