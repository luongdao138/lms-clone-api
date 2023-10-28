import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { authOptions } from './auth.constant';

@Injectable()
export class AuthCronService {
  private logger = new Logger(AuthCronService.name);

  constructor(
    private readonly authService: AuthService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleRemoveExpiredTokens() {
    this.logger.debug(
      `========Cron job runs to remove expired access and refresh tokens========`,
    );

    const [accessTokenKeys, refreshTokenKeys] = await Promise.all([
      this.redis.keys(authOptions.tokens.whiteListAccessTokenPrefix + '*'),
      this.redis.keys(authOptions.tokens.whiteListRefreshTokenPrefix + '*'),
    ]);

    const accessIds = accessTokenKeys.map((key) =>
      key.replaceAll(authOptions.tokens.whiteListAccessTokenPrefix, ''),
    );
    const refreshIds = refreshTokenKeys.map((key) =>
      key.replaceAll(authOptions.tokens.whiteListRefreshTokenPrefix, ''),
    );

    const userIds = [...new Set([...accessIds, ...refreshIds])];

    for (const userId of userIds) {
      await this.authService.revokeExpiredJwtTokens(+userId);
    }
  }
}
