import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { PasswordModule } from '../password/password.module';

@Module({
  imports: [PasswordModule.registerAsync()],
  providers: [AuthResolver],
})
export class AuthModule {}
