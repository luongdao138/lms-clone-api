import { Global, Module } from '@nestjs/common';
import { RateLimitingService } from './rate-limit/rate-limiting.service';

@Global()
@Module({
  imports: [],
  providers: [RateLimitingService],
  exports: [RateLimitingService],
})
export class SharedModule {}
