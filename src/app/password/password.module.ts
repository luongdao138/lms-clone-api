import { DynamicModule, Module } from '@nestjs/common';

@Module({})
export class PasswordModule {
  static register(): DynamicModule {
    return {
      module: PasswordModule,
    };
  }

  static registerAsync(): DynamicModule {
    return {
      module: PasswordModule,
    };
  }
}
