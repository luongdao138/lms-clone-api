import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

export class HealthServiceBase {
  private logger = new Logger(HealthServiceBase.name);

  constructor(protected readonly prismaService: PrismaService) {}

  async isDbReady() {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error(error);
      return false;
    }
  }
}
