import { DynamicModule, FactoryProvider, Provider, Type } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export type PrismaModuleOptions = Prisma.PrismaClientOptions & {
  isGlobal?: boolean;
};

export interface PrismaModuleAsyncOptions {
  isGlobal?: boolean;
  useClass?: Type<PrismaOptionsFactory>;
  useExisting?: Type<PrismaOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => PrismaModuleOptions | Promise<Prisma.PrismaClientOptions>;
  inject?: FactoryProvider['inject'];
  extraProviders?: Provider[];
  imports?: DynamicModule['imports'];
}

export interface PrismaOptionsFactory {
  createPrismaOptions():
    | Prisma.PrismaClientOptions
    | Promise<Prisma.PrismaClientOptions>;
}
