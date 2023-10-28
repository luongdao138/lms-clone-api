import {
  Inject,
  OnModuleDestroy,
  OnModuleInit,
  Optional,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { PRISMA_SERVICE_OPTIONS } from './prisma.constant';

export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Optional()
    @Inject(PRISMA_SERVICE_OPTIONS)
    protected readonly options: Prisma.PrismaClientOptions,
  ) {
    super(options);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
