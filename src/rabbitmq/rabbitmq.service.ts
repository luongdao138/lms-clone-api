import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { EXCHANGE_NAME } from './rabbitmq.constant';
import { Options } from 'amqplib';

@Injectable()
export class RabbitMqService {
  constructor(private readonly connection: AmqpConnection) {}

  async publish<T = any>(
    exchange: EXCHANGE_NAME,
    routingKey: string,
    message: T,
    options: Options.Publish = {},
  ) {
    await this.connection.publish<T>(exchange, routingKey, message, options);
  }
}
