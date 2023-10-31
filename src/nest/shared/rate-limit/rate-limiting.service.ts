import { Injectable } from '@nestjs/common';
import { BucketOptions } from './rate-limiting.type';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { merge } from 'lodash';
import { TimeUnit } from 'src/types/common';

@Injectable()
export class RateLimitingService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async bucket(key: string, options: BucketOptions) {
    options = merge(
      { increment: true, incrementPerAccess: 1, timeLimit: 1 },
      options,
    );

    const pipeline = this.redis.pipeline();
    if (options.increment) {
      pipeline.incrby(key, options.incrementPerAccess);
    }
    pipeline.get(key);
    pipeline.expire(
      key,
      this.getTimeInSeconds(options.timeLimit, options.timeUnit),
    );

    const result = await pipeline.exec();

    return +result[1][1] > options.accessLimit;
  }

  private getTimeInSeconds(time: number, timeUnit: TimeUnit) {
    const map = {
      [TimeUnit.DAY]: 60 * 60 * 24,
      [TimeUnit.HOUR]: 60 * 60,
      [TimeUnit.MINUTE]: 60,
      [TimeUnit.SECOND]: 1,
    };

    return map[timeUnit] * time;
  }
}
