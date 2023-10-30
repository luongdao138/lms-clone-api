import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { EXCHANGE_NAME } from './rabbitmq.constant';
import { Options } from 'amqplib';

@Injectable()
export class RabbitMqService {
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
    return this.publishTo<T>(
      EXCHANGE_NAME.LMS_EVENT_BUS,
      routingKey,
      message,
      options,
    );
  }
}
