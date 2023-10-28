import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { Environment } from 'src/constants/env';
import { PrismaOptionsFactory } from 'src/prisma/prisma.interface';
import { splitEnv } from 'src/utils/splitEnv';

@Injectable()
export class PrismaOptionsService implements PrismaOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  async createPrismaOptions(): Promise<Prisma.PrismaClientOptions> {
    return {
      log: splitEnv(this.configService.get(Environment.PRISMA_LOG_LEVELS)),
      errorFormat:
        this.configService.get(Environment.PRISMA_ERROR_FORMAT) ?? 'minimal',
    };
  }
}
