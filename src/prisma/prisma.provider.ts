import { Provider } from '@nestjs/common';
import {
  PrismaModuleAsyncOptions,
  PrismaModuleOptions,
  PrismaOptionsFactory,
} from './prisma.interface';
import { PrismaService } from './prisma.service';
import { PRISMA_SERVICE_OPTIONS } from './prisma.constant';
import { omit } from 'lodash';

export function createProviders(options: PrismaModuleOptions): Provider[] {
  return [
    PrismaService,
    {
      provide: PRISMA_SERVICE_OPTIONS,
      useValue: omit(options, ['isGlobal']),
    },
  ];
}

export function createAsyncProviders(
  options: PrismaModuleAsyncOptions,
): Provider[] {
  const providers: Provider[] = [PrismaService];

  if (options.useFactory) {
    providers.push({
      provide: PRISMA_SERVICE_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject ?? [],
    });
  }

  if (options.useExisting || options.useClass) {
    if (options.useClass) {
      providers.push({
        provide: options.useClass,
        useClass: options.useClass,
      });
    }

    providers.push({
      provide: PRISMA_SERVICE_OPTIONS,
      async useFactory(optionsFactory: PrismaOptionsFactory) {
        return await optionsFactory.createPrismaOptions();
      },
      inject: [options.useClass || options.useExisting],
    });
  }

  return providers;
}
