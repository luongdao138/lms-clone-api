import { DynamicModule, Module } from '@nestjs/common';
import {
  PrismaModuleAsyncOptions,
  PrismaModuleOptions,
} from './prisma.interface';
import { createAsyncProviders, createProviders } from './prisma.provider';

@Module({})
export class PrismaModule {
  static forRoot(options: PrismaModuleOptions): DynamicModule {
    const providers = createProviders(options);

    return {
      module: PrismaModule,
      global: options.isGlobal,
      providers,
      exports: providers,
    };
  }

  static forRootAsync(options: PrismaModuleAsyncOptions): DynamicModule {
    const providers = [
      ...createAsyncProviders(options),
      ...(options.extraProviders ?? []),
    ];

    return {
      module: PrismaModule,
      global: options.isGlobal,
      imports: options.imports ?? [],
      providers,
      exports: providers,
    };
  }
}
