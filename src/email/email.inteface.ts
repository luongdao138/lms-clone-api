import { DynamicModule, FactoryProvider, Provider, Type } from '@nestjs/common';
import { HelperDeclareSpec, RuntimeOptions } from 'handlebars';
import { SendMailOptions, Transport, TransportOptions } from 'nodemailer';
import JSONTransport from 'nodemailer/lib/json-transport';
import SendmailTransport from 'nodemailer/lib/sendmail-transport';
import SESTransport from 'nodemailer/lib/ses-transport';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import StreamTransport from 'nodemailer/lib/stream-transport';
import { EMAIL_TEMPLATE } from './email.constant';

export type Options =
  | SMTPTransport.Options
  | SMTPPool.Options
  | SendmailTransport.Options
  | StreamTransport.Options
  | JSONTransport.Options
  | SESTransport.Options
  | TransportOptions;

export type TransportType =
  | Options
  | SMTPTransport
  | string
  | SMTPPool
  | SendmailTransport
  | StreamTransport
  | SESTransport
  | Transport;

export interface MailOptions {
  transport: TransportType;
  defaults?: Options;
  template?: {
    dir?: string;
    options?: CompileOptions;
  };
  handlebars?: {
    helpers?: HelperDeclareSpec;
    runtimeOptions?: RuntimeOptions;
  };
}

export interface EmailModuleOptions {
  isGlobal?: boolean;
  mailOptions: MailOptions;
}

export interface EmailModuleAsyncOptions {
  isGlobal?: boolean;
  useClass?: Type<EmailOptionsFactory>;
  useExisting?: Type<EmailOptionsFactory>;
  useFactory?: (...args: any[]) => MailOptions | Promise<MailOptions>;
  inject?: FactoryProvider['inject'];
  extraProviders?: Provider[];
  imports?: DynamicModule['imports'];
}

export interface EmailOptionsFactory {
  createMailOptions(): MailOptions | Promise<MailOptions>;
}

export interface ISendMailOptions extends SendMailOptions {
  context?: Record<string, any>;
  template?: EMAIL_TEMPLATE;
}
