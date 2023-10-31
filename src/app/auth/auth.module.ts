import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { PasswordModule } from '../password/password.module';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GqlJwtAuthGuard } from './guards/gql-jwt.guard';
import { GqlJwtRefreshTokenGuard } from './guards/gql-jwt-refresh-token.guard';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { AuthCronService } from './auth-cron.service';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [
    PasswordModule.registerAsync({}),
    UserModule,
    UserProfileModule,
    PassportModule,
    OtpModule.register({
      length: 6,
      generateOptions: {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      },
    }),
    JwtModule.register({}),
  ],
  providers: [
    AuthResolver,
    AuthService,
    JwtStrategy,
    GqlJwtAuthGuard,
    GqlJwtRefreshTokenGuard,
    JwtRefreshTokenStrategy,
    AuthCronService,
  ],
  exports: [AuthService, GqlJwtAuthGuard, GqlJwtRefreshTokenGuard],
})
export class AuthModule {}
