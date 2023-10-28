import { Provider } from '@nestjs/common';
import {
  PasswordOptionsFactory,
  PasswordModuleOptions,
  PasswordModuleAsyncOptions,
} from './password.interface';
import { PASSWORD_SERVICE_OPTIONS } from './password.constant';

export function createProviders(options: PasswordModuleOptions): Provider[] {
  return [
    {
      provide: PASSWORD_SERVICE_OPTIONS,
      useValue: options,
    },
  ];
}

export function createAsyncProviders(
  options: PasswordModuleAsyncOptions,
): Provider[] {
  if (options.useFactory) {
    return [
      {
        provide: PASSWORD_SERVICE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      },
    ];
  }

  if (options.useClass || options.useExisting) {
    const providers = [];

    if (options.useClass) {
      providers.push({
        provide: options.useClass,
        useClass: options.useClass,
      });
    }

    providers.push({
      provide: PASSWORD_SERVICE_OPTIONS,
      useFactory(optionsFactory: PasswordOptionsFactory) {
        return optionsFactory.createPasswordOptions();
      },
      inject: [options.useClass || options.useExisting],
    });

    return providers;
  }

  return [
    {
      provide: PASSWORD_SERVICE_OPTIONS,
      useValue: {},
    },
  ];
}
