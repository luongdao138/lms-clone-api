import { Inject, Injectable, Logger } from '@nestjs/common';
import { MAIL_OPTIONS } from './email.constant';
import { MailOptions, TransportType } from './email.inteface';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailTransportFactory {
  private readonly logger = new Logger(MailTransportFactory.name);

  constructor(
    @Inject(MAIL_OPTIONS) private readonly mailOptions: MailOptions,
  ) {}

  async createTransport(options?: TransportType) {
    const transporter = nodemailer.createTransport(
      options || this.mailOptions.transport,
      this.mailOptions.defaults,
    );

    try {
      await transporter.verify();
      return transporter;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
