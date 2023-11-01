import { RedisHealthModule } from '@liaoliaots/nestjs-redis-health';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthResolver } from './health.resolver';

@Module({
  imports: [TerminusModule, RedisHealthModule],
  providers: [HealthResolver],
})
export class HealthModule {}
