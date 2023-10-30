import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { ModuleName } from 'src/constants/moduleNames';
import { EXCHANGE_NAME } from 'src/rabbitmq/rabbitmq.constant';
import {
  generateQueueName,
  generateBindingKey,
} from 'src/rabbitmq/rabbitmq.util';
import { BaseEvent } from 'src/types/BaseEvent';

@Injectable()
export class EmailSubscriber {
  private logger = new Logger(EmailSubscriber.name);

  @RabbitSubscribe({
    queue: generateQueueName(ModuleName.EMAIL, ModuleName.USER),
    routingKey: generateBindingKey(ModuleName.USER),
    exchange: EXCHANGE_NAME.LMS_EVENT_BUS,
  })
  handleSendEmail(msg: BaseEvent, amqpMsg: ConsumeMessage) {
    this.logger.log(
      `Email service consumer receives message: ===> ${JSON.stringify(msg)}`,
      amqpMsg.fields.routingKey,
    );
  }
}
