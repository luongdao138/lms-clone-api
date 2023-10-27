import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { RedisHealthIndicator } from '@liaoliaots/nestjs-redis-health';
import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { Redis } from 'ioredis';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    protected readonly healthService: HealthCheckService,
    @InjectRedis() protected readonly redis: Redis,
    protected prismaIndicator: PrismaHealthIndicator,
    protected readonly redisIndicator: RedisHealthIndicator,
    protected readonly prismaService: PrismaService,
  ) {}

  @Get('live')
  healthLive() {
    return this.healthService.check([]);
  }

  @Get('ready')
  async healthReady() {
    return this.healthService.check([
      () =>
        this.redisIndicator.checkHealth('redis', {
          type: 'redis',
          client: this.redis,
          timeout: 2000,
        }),
      () =>
        this.prismaIndicator.pingCheck('prisma', this.prismaService, {
          timeout: 2000,
        }),
    ]);
  }
}
