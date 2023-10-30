import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RabbitMqOptionsService } from 'src/nest/providers/RabbitMqOptions.service';
import { RabbitMQHealthIndicator } from './rabbitmq.health';

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
  ],
  providers: [RabbitMQHealthIndicator],
})
export class AppRabbitMQModule {}
