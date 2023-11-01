import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Transporter } from 'nodemailer';
import { MAIL_OPTIONS } from './email.constant';
import { ISendMailOptions, MailOptions } from './email.inteface';
import { HandlebarsAdapter } from './handlebars.adapter';
import { MailTransportFactory } from './mail-transport.factory';
import { GraphQLException } from 'src/graphql/errors/GraphQLError';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: Transporter;
  private logger = new Logger(EmailService.name);

  constructor(
    @Inject(MAIL_OPTIONS) private readonly mailOptions: MailOptions,
    private readonly mailTransportFactory: MailTransportFactory,
    private readonly handlebarsAdapter: HandlebarsAdapter,
  ) {
    if (!mailOptions.transport) {
      throw new GraphQLException('Mail transport must be provided');
    }
  }

  private initHandlebarsAdapter() {
    this.transporter.use('compile', (mail: any, callback: any) => {
      if (mail.data.html) {
        return callback();
      }

      if (!mail.data.template) {
        throw new GraphQLException('Email template must be provided');
      }

      return this.handlebarsAdapter.compile(mail, callback);
    });
  }

  async onModuleInit() {
    this.transporter = await this.mailTransportFactory.createTransport();
    if (!this.transporter) {
      this.logger.warn(
        'Initialized tranporter failed. Please check your smtp config',
      );
      return;
    }

    this.initHandlebarsAdapter();
    this.logger.log('Handlebars adapter successfully initialized');
  }

  async send(sendMailOptions: ISendMailOptions) {
    if (!this.transporter) return;

    return await this.transporter.sendMail(sendMailOptions);
  }
}
