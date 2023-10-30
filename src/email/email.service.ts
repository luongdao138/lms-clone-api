import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import {
  BINDING_ROUTING_KEY,
  EXCHANGE_NAME,
  QUEUE_NAME,
} from 'src/rabbitmq/rabbitmq.constant';

@Injectable()
export class EmailService {
  private logger = new Logger(EmailService.name);

  @RabbitSubscribe({
    queue: QUEUE_NAME.EMAIL,
    routingKey: BINDING_ROUTING_KEY.EMAIL,
    exchange: EXCHANGE_NAME.EMAIL,
  })
  handleSendEmail(msg: any, amqpMsg: ConsumeMessage) {
    this.logger.log(
      `Email service consumer receives message: ===> ${JSON.stringify(msg)}`,
    );
  }
}
