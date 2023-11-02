import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OtpService } from './otp.service';

@Injectable()
export class OtpCronService {
  private logger = new Logger(OtpCronService.name);

  constructor(private readonly otpService: OtpService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleRemoveExpiredOtps() {
    this.logger.debug(`========Cron job runs to remove expired otps========`);

    await this.otpService.deleteExpiredOtps();
  }
}
