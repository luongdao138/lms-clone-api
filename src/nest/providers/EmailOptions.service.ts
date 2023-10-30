import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from 'src/constants/env';
import { EmailOptionsFactory, MailOptions } from 'src/email/email.inteface';

@Injectable()
export class EmailOptionsService implements EmailOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createMailOptions(): MailOptions {
    return {
      transport: {
        host: this.configService.getOrThrow(Environment.EMAIL_HOST),
        secure: false,
        auth: {
          user: this.configService.getOrThrow(Environment.EMAIL_USER),
          pass: this.configService.getOrThrow(Environment.EMAIL_PASS),
        },
      },
      defaults: {
        from: this.configService.getOrThrow(Environment.EMAIL_FROM),
      },
      template: {},
    };
  }
}
