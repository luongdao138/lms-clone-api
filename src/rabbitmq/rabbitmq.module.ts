import { Global, Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMQHealthIndicator } from './rabbitmq.health';
import { RabbitMqOptionsService } from '../nest/providers/RabbitMqOptions.service';
import { RabbitMqService } from './rabbitmq.service';

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useClass: RabbitMqOptionsService,
    }),
  ],
  exports: [
    RabbitMQModule.forRootAsync(RabbitMQModule, {
      useClass: RabbitMqOptionsService,
    }),
    RabbitMQHealthIndicator,
    RabbitMqService,
  ],
  providers: [RabbitMQHealthIndicator, RabbitMqService],
})
export class AppRabbitMQModule {}
