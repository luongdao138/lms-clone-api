import { DynamicModule, FactoryProvider, Type } from '@nestjs/common';

export interface PasswordHashingStrategy {
  hash(plain: string): string | Promise<string>;
  verify(plain: string, hashed: string): boolean | Promise<boolean>;
  generateRandomPassword(): string | Promise<string>;
}

export interface PasswordModuleOptions {
  strategy?: Type<PasswordHashingStrategy>;
  strategyOptions?: Record<string, any>;
}

export interface PasswordModuleAsyncOptions {
  useFactory?: FactoryProvider<PasswordModuleOptions>['useFactory'];
  useClass?: Type<PasswordOptionsFactory>;
  useExisting?: Type<PasswordOptionsFactory>;
  inject?: any[];
  imports?: DynamicModule['imports'];
  extraProviders?: DynamicModule['providers'];
}

export interface PasswordOptionsFactory {
  createPasswordOptions: () =>
    | PasswordModuleOptions
    | Promise<PasswordModuleOptions>;
}
