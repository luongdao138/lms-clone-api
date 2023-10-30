import { Provider } from '@nestjs/common';
import { MAIL_OPTIONS } from './email.constant';
import { EmailService } from './email.service';
import {
  EmailModuleAsyncOptions,
  MailOptions,
  EmailOptionsFactory,
} from './email.inteface';
import { MailTransportFactory } from './mail-transport.factory';
import { HandlebarsAdapter } from './handlebars.adapter';

const commonProviders = [MailTransportFactory, EmailService, HandlebarsAdapter];

export function createProvider(options: MailOptions): Provider[] {
  return [{ provide: MAIL_OPTIONS, useValue: options }, ...commonProviders];
}

export function createAsyncProviders(options: EmailModuleAsyncOptions) {
  const providers: Provider[] = [...commonProviders];

  if (options.useFactory) {
    providers.push({
      provide: MAIL_OPTIONS,
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
      provide: MAIL_OPTIONS,
      async useFactory(optionsFactory: EmailOptionsFactory) {
        return await optionsFactory.createMailOptions();
      },
      inject: [options.useClass || options.useExisting],
    });
  }

  return providers;
}
