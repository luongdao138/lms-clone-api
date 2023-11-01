import { Query, Resolver } from '@nestjs/graphql';
import { GqlHealth } from './dto/health.gql';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { RedisHealthIndicator } from '@liaoliaots/nestjs-redis-health';
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { Redis } from 'ioredis';
import { PrismaService } from 'src/prisma/prisma.service';
import { RabbitMQHealthIndicator } from 'src/rabbitmq/rabbitmq.health';

@Resolver()
export class HealthResolver {
  constructor(
    protected readonly healthService: HealthCheckService,
    @InjectRedis() protected readonly redis: Redis,
    protected prismaIndicator: PrismaHealthIndicator,
    protected readonly redisIndicator: RedisHealthIndicator,
    protected readonly prismaService: PrismaService,
    protected readonly rabbitMQHeathIndicator: RabbitMQHealthIndicator,
  ) {}

  @Query(() => GqlHealth)
  healthReady() {
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
      () => this.rabbitMQHeathIndicator.check('rabbitmq'),
    ]);
  }
}
