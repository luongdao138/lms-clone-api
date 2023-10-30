import { RedisHealthModule } from '@liaoliaots/nestjs-redis-health';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, RedisHealthModule],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
