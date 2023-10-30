import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { RedisHealthModule } from '@liaoliaots/nestjs-redis-health';
import { AppRabbitMQModule } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [TerminusModule, RedisHealthModule, AppRabbitMQModule],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
