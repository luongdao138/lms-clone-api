import { DynamicModule, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailConsumer } from './consumers/email.consumer';
import { createAsyncProviders, createProvider } from './email.provider';
import { EmailModuleAsyncOptions, EmailModuleOptions } from './email.inteface';

@Module({})
export class EmailModule {
  static forRoot(options: EmailModuleOptions): DynamicModule {
    const providers = [...createProvider(options.mailOptions), EmailConsumer];
    const exports = [EmailService];

    return {
      module: EmailModule,
      exports,
      providers,
      global: options.isGlobal,
    };
  }

  static forRootAsync(options: EmailModuleAsyncOptions): DynamicModule {
    const providers = [
      ...createAsyncProviders(options),
      ...(options.extraProviders ?? []),
      EmailConsumer,
    ];
    const exports = [EmailService];

    return {
      module: EmailModule,
      global: options.isGlobal,
      imports: options.imports ?? [],
      providers,
      exports,
    };
  }
}
