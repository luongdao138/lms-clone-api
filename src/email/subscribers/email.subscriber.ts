import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { ModuleName } from 'src/constants/module-names';
import {
  generateQueueName,
  generateBindingKey,
} from 'src/rabbitmq/rabbitmq.util';
import { EmailService } from '../email.service';
import { EMAIL_TEMPLATE } from '../email.constant';
import { DefaultRabbitSubsribe } from 'src/nest/decorators/default-rabbit-subscribe';

@Injectable()
export class EmailSubscriber {
  constructor(private readonly emailService: EmailService) {}

  private logger = new Logger(EmailSubscriber.name);

  @DefaultRabbitSubsribe({
    queue: generateQueueName(ModuleName.EMAIL, ModuleName.USER),
    routingKey: generateBindingKey(ModuleName.USER),
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
      context: {
        email: msg.user.email,
      },
    });
  }
}
