import { DynamicModule, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailSubscriber } from './subscribers/email.subscriber';
import { createAsyncProviders, createProvider } from './email.provider';
import { EmailModuleAsyncOptions, EmailModuleOptions } from './email.inteface';

@Module({})
export class EmailModule {
  static forRoot(options: EmailModuleOptions): DynamicModule {
    const providers = [...createProvider(options.mailOptions), EmailSubscriber];
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
      EmailSubscriber,
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
