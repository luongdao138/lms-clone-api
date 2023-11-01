import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OTP_OPTIONS } from './otp.constant';
import { OtpOptions } from './otp.interface';
import { OtpService } from './otp.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [JwtModule.register({}), UserModule],
})
export class OtpModule {
  static register(options: OtpOptions): DynamicModule {
    return {
      module: OtpModule,
      providers: [
        {
          provide: OTP_OPTIONS,
          useValue: options,
        },
        OtpService,
      ],
      exports: [OtpService],
    };
  }
}
