import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserProfileModule } from '../user-profile/user-profile.module';

@Module({
  imports: [UserProfileModule],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
