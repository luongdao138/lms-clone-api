import { DynamicModule, Module } from '@nestjs/common';
import {
  PasswordModuleAsyncOptions,
  PasswordModuleOptions,
} from './password.interface';
import { createAsyncProviders, createProviders } from './password.provider';
import { PasswordService } from './password.service';

@Module({
  providers: [PasswordService],
  exports: [PasswordService],
})
export class PasswordModule {
  static register(options: PasswordModuleOptions = {}): DynamicModule {
    const providers = createProviders(options);

    return {
      providers,
      module: PasswordModule,
    };
  }

  static registerAsync(
    options: PasswordModuleAsyncOptions = {},
  ): DynamicModule {
    const providers = createAsyncProviders(options);

    return {
      module: PasswordModule,
      providers: providers.concat(options.extraProviders ?? []),
      imports: options.imports ?? [],
    };
  }
}
