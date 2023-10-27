import { PasswordHashingStrategy } from '../password.interface';
import { merge } from 'lodash';
import { hash as hashBcrypt, compare } from 'bcryptjs';

export interface BcryptOptions {
  bcryptSaltRounds?: string | number;
}

export class BcryptStrategy implements PasswordHashingStrategy {
  private options: BcryptOptions = {
    bcryptSaltRounds: 10,
  };

  constructor(_options: BcryptOptions = {}) {
    this.options = merge(this.options, _options);
  }

  async hash(plain: string): Promise<string> {
    return hashBcrypt(plain, this.options.bcryptSaltRounds);
  }

  async verify(plain: string, hashed: string): Promise<boolean> {
    return compare(plain, hashed);
  }

  generateRandomPassword(): string {
    return '';
  }
}
