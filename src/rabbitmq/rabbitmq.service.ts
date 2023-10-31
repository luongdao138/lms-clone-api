import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import {
  DEFAULT_EXPIRATION,
  EXCHANGE_NAME,
  QUEUE_NAME,
} from './rabbitmq.constant';
import { ConsumeMessage, Options } from 'amqplib';
import { merge } from 'lodash';
import { DefaultRabbitSubsribe } from 'src/nest/decorators/default-rabbit-subscribe';

@Injectable()
export class RabbitMqService {
  private logger = new Logger(RabbitMqService.name);

  constructor(private readonly connection: AmqpConnection) {}

  publishTo<T = any>(
    exchange: EXCHANGE_NAME,
    routingKey: string,
    message: T,
    options: Options.Publish = {},
  ) {
    return this.connection.publish<T>(exchange, routingKey, message, options);
  }

  publish<T = any>(
    routingKey: string,
    message: T,
    options: Options.Publish = {},
  ) {
    const defaultMessageOptions: Options.Publish = {
      expiration: DEFAULT_EXPIRATION,
      persistent: true,
    };

    return this.publishTo<T>(
      EXCHANGE_NAME.LMS_EVENT_BUS,
      routingKey,
      message,
      merge(defaultMessageOptions, options),
    );
  }

  // Alerting when message is unroutable and go to fallback exchange
  @DefaultRabbitSubsribe({
    exchange: EXCHANGE_NAME.FALLBACK,
    queue: QUEUE_NAME.ALERT,
    queueOptions: {},
    routingKey: '',
  })
  alert(message: any, ampMessage: ConsumeMessage) {
    this.logger.warn(
      `Message with routing key: ${
        ampMessage.fields.routingKey
      }, published to exchange: ${
        ampMessage.fields.exchange
      } is unroutable ===> ${JSON.stringify(message)}`,
    );
  }
}
