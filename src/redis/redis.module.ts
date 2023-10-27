import { Module } from '@nestjs/common';
import { RedisModule as LiaoRedisModule } from '@liaoliaots/nestjs-redis';
import { RedisOptionsService } from 'src/nest/providers/RedisOptions.service';

@Module({
  imports: [
    LiaoRedisModule.forRootAsync({
      useClass: RedisOptionsService,
    }),
  ],
})
export class RedisModule {}
