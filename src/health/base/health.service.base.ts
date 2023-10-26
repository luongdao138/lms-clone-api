import { Logger } from '@nestjs/common';

export class HealthServiceBase {
  private logger = new Logger(HealthServiceBase.name);

  async isDbReady() {
    try {
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
