import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMQHealthIndicator } from './rabbitmq.health';
import { RabbitMqService } from './rabbitmq.service';

@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useClass: RabbitMqService,
    }),
  ],
  exports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useClass: RabbitMqService,
    }),
    RabbitMQHealthIndicator,
  ],
  providers: [RabbitMQHealthIndicator, RabbitMqService],
})
export class AppRabbitMQModule {}
