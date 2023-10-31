import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { ModuleName } from 'src/constants/module-names';
import {
  generateQueueName,
  generateBindingKey,
} from 'src/rabbitmq/rabbitmq.util';
import { EmailService } from '../email.service';
import { DefaultRabbitSubsribe } from 'src/nest/decorators/default-rabbit-subscribe';

@Injectable()
export class EmailConsumer {
  constructor(private readonly emailService: EmailService) {}

  private logger = new Logger(EmailConsumer.name);

  @DefaultRabbitSubsribe({
    queue: generateQueueName(ModuleName.EMAIL, ModuleName.USER),
    routingKey: generateBindingKey(ModuleName.USER),
  })
  async handleUserEvents(msg: any, amqpMsg: ConsumeMessage) {
    this.logger.log(
      `Email module consume user events: ===> ${JSON.stringify(msg)}`,
      amqpMsg.fields.routingKey,
    );
  }

  @DefaultRabbitSubsribe({
    queue: generateQueueName(ModuleName.EMAIL, ModuleName.ORDER),
    routingKey: generateBindingKey(ModuleName.ORDER),
  })
  async handleOrderEvents(msg: any, amqpMsg: ConsumeMessage) {
    this.logger.log(
      `Email module consume order events: ===> ${JSON.stringify(msg)}`,
      amqpMsg.fields.routingKey,
    );
  }
}
