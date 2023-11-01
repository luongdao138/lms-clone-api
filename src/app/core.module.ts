import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { UserProfileModule } from './user-profile/user-profile.module';
import { SharedModule } from 'src/nest/shared/share.module';

@Module({
  imports: [AuthModule, UserModule, UserProfileModule, SharedModule],
})
export class CoreModule {}
