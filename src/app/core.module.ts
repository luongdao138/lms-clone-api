import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { UserProfileModule } from './user-profile/user-profile.module';

@Module({
  imports: [AuthModule, UserModule, UserProfileModule],
  exports: [AuthModule, UserModule, UserProfileModule],
})
export class CoreModule {}
