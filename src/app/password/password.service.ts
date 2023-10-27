import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';
import {
  PasswordHashingStrategy,
  PasswordModuleOptions,
} from './password.interface';
import { PASSWORD_SERVICE_OPTIONS } from './password.constant';
import { BcryptStrategy } from './strategies/bcrypt.stategy';

@Injectable()
export class PasswordService implements OnModuleInit {
  private strategy: PasswordHashingStrategy;

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
      this.options.strategy = BcryptStrategy;
    }

    this.strategy = new this.options.strategy(this.options.strategyOptions);
  }

  hash(plain: string) {
    return this.strategy.hash(plain);
  }

  verify(plain: string, hashed: string) {
    return this.strategy.verify(plain, hashed);
  }
}
