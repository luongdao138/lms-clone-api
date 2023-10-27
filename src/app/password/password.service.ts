import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { PasswordModuleOptions } from './password.interface';
import { PASSWORD_SERVICE_OPTIONS } from './password.constant';
import { BcryptStrategy } from './strategies/bcrypt.stategy';

@Injectable()
export class PasswordService implements OnModuleInit {
  constructor(
    @Optional()
    @Inject(PASSWORD_SERVICE_OPTIONS)
    private readonly options: PasswordModuleOptions,
  ) {}

  onModuleInit() {
    if (!this.options.strategyOptions) {
      this.options.strategyOptions = {
        bcryptSaltRounds: 10,
      };
    }

    if (!this.options.strategy) {
      this.options.strategy = new BcryptStrategy(this.options.strategyOptions);
    }
  }
}
