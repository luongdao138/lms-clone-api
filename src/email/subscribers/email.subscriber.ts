import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { ModuleName } from 'src/constants/module-names';
import { EXCHANGE_NAME } from 'src/rabbitmq/rabbitmq.constant';
import {
  generateQueueName,
  generateBindingKey,
} from 'src/rabbitmq/rabbitmq.util';
import { EmailService } from '../email.service';
import { EMAIL_TEMPLATE } from '../email.constant';

@Injectable()
export class EmailSubscriber {
  constructor(private readonly emailService: EmailService) {}

  private logger = new Logger(EmailSubscriber.name);

  @RabbitSubscribe({
    queue: generateQueueName(ModuleName.EMAIL, ModuleName.USER),
    routingKey: generateBindingKey(ModuleName.USER),
    exchange: EXCHANGE_NAME.LMS_EVENT_BUS,
  })
  async handleUserEvents(msg: any, amqpMsg: ConsumeMessage) {
    this.logger.log(
      `Email service consumer receives message: ===> ${JSON.stringify(msg)}`,
      amqpMsg.fields.routingKey,
    );

    await this.emailService.send({
      subject: 'Test send mail',
      template: EMAIL_TEMPLATE.USER_SIGN_UP,
      to: msg.user.email,
    });
  }
}
