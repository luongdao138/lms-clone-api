import {
  RabbitHandlerConfig,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { merge } from 'lodash';
import { EXCHANGE_NAME } from 'src/rabbitmq/rabbitmq.constant';

type RabbitSubscribeConfig = Pick<
  RabbitHandlerConfig,
  | 'queue'
  | 'name'
  | 'connection'
  | 'exchange'
  | 'routingKey'
  | 'createQueueIfNotExists'
  | 'assertQueueErrorHandler'
  | 'queueOptions'
  | 'errorBehavior'
  | 'errorHandler'
  | 'allowNonJsonMessages'
>;

export const DefaultRabbitSubsribe = (config: RabbitSubscribeConfig) => {
  const defaultConfig: Partial<RabbitSubscribeConfig> = {
    exchange: EXCHANGE_NAME.LMS_EVENT_BUS,
    errorHandler() {
      // do nothing => just to override the requeue behavior
    },
  };

  return RabbitSubscribe(merge(defaultConfig, config));
};
