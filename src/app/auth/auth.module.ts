import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { PasswordModule } from '../password/password.module';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GqlJwtAuthGuard } from './guards/gql-jwt.guard';

@Module({
  imports: [
    PasswordModule.registerAsync({}),
    UserModule,
    PassportModule,
    JwtModule.register({}),
  ],
  providers: [AuthResolver, AuthService, JwtStrategy, GqlJwtAuthGuard],
  exports: [AuthService, GqlJwtAuthGuard],
})
export class AuthModule {}
