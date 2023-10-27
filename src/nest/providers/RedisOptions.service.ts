import {
  RedisModuleOptions,
  RedisOptionsFactory,
} from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from 'src/constants/env';

@Injectable()
export class RedisOptionsService implements RedisOptionsFactory {
  constructor(private configService: ConfigService) {}

  async createRedisOptions(): Promise<RedisModuleOptions> {
    return {
      config: {
        host: this.configService.get(Environment.REDIS_HOST),
        port: this.configService.get(Environment.REDIS_PORT),
      },
      readyLog: true, // print log when redis server is ready to receive commands
      errorLog: true,
    };
  }
}
