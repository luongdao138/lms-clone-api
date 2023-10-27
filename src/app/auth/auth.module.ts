import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { PasswordModule } from '../password/password.module';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [PasswordModule.registerAsync({}), UserModule],
  providers: [AuthResolver, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
