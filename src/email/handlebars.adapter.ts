import { Inject, Injectable } from '@nestjs/common';
import { MailOptions } from './email.inteface';
import { MAIL_OPTIONS } from './email.constant';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { memoizeReadFile } from 'src/utils/memoize-readfile';
import { get, set, unset } from 'lodash';

@Injectable()
export class HandlebarsAdapter {
  constructor(@Inject(MAIL_OPTIONS) private readonly mailOptions: MailOptions) {
    Handlebars.registerHelper('concat', (...args) => {
      args.pop();
      return args.join('');
    });
    Handlebars.registerHelper(mailOptions.handlebars?.helpers || {});
  }

  // mail.options.template => templateId, mailOptions.template.dir => templateDir
  compile(mail: any, callback: any) {
    const templateDir =
      this.mailOptions.template.dir ||
      path.join(__dirname, '../assets', 'templates');
    const templateId = mail.data.template;
    const templateExt = path.extname(templateId) || '.hbs';

    const templatePath = path.join(
      templateDir,
      templateId.replace(templateExt, '') + templateExt,
    );

    try {
      const templateContent = memoizeReadFile(templatePath, 'utf-8');
      const compiledContent = Handlebars.compile(
        templateContent,
        get(this.mailOptions, 'template.options', {}),
      );

      const runtimeOptions = get(
        this.mailOptions,
        'handlebars.runtimeOptions',
        { partials: undefined, data: {} },
      );
      const renderedContent = compiledContent(
        get(mail, 'data.context', {}),
        runtimeOptions,
      );

      set(mail, 'data.html', renderedContent);

      unset(mail, 'data.context');
      unset(mail, 'data.template');

      return callback();
    } catch (error) {
      return callback(error);
    }
  }
}
