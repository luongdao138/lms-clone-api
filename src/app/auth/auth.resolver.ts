import {
  HttpException,
  HttpStatus,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthToken } from 'src/nest/decorators/auth-token.decorator';
import { AuthUser } from 'src/nest/decorators/user.decorator';
import { GqlResolverExceptionsFilter } from 'src/nest/filters/gql-exception.filter';
import { AuthService } from './auth.service';
import { LoginArgs } from './dto/Login.args';
import { SignOutArgs } from './dto/Signout.args';
import { SignUpArgs } from './dto/Signup.args';
import { GqlJwtAuthGuard } from './guards/gql-jwt.guard';
import { GqlJwtRefreshTokenGuard } from './guards/gql-jwt-refresh-token.guard';
import { Public } from 'src/nest/decorators/public.decorator';
import { Roles } from 'src/nest/decorators/role.decorator';
import { ROLE_ALL } from 'src/constants/role';
import { GqlUser } from 'src/graphql/models/User.gql';
import { User } from '@prisma/client';
import { GqlSignup } from './dto/Signup.gql';
import { GqlAuth } from './dto/Auth.gql';
import { VerifyOtpArgs } from './dto/VerifyOtp.args';
import { GqlVerifyOtp } from './dto/VerifyOtp.gql';

@Resolver(() => GqlAuth)
@UseFilters(GqlResolverExceptionsFilter)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => GqlSignup)
  async signup(
    @Args({ nullable: false }) args: SignUpArgs,
  ): Promise<GqlSignup> {
    const { data } = args;

    const { token } = await this.authService.signup(data);
    return { token };
  }

  @Public()
  @Query(() => GqlVerifyOtp)
  async verifyOtp(@Args() args: VerifyOtpArgs) {
    const user = await this.authService.verifyOtp(args.data);
    if (!user) {
      throw new HttpException('Otp is invalid', HttpStatus.BAD_REQUEST);
    }

    return user;
  }

  @Public()
  @Mutation(() => GqlAuth)
  async login(@Args({ nullable: false }) args: LoginArgs): Promise<GqlAuth> {
    const { data } = args;

    const tokens = await this.authService.login(data);
    return tokens;
  }

  @Query(() => GqlUser)
  @Roles(ROLE_ALL)
  @UseGuards(GqlJwtAuthGuard)
  async me(@AuthUser() user: User): Promise<User> {
    return user;
  }

  @Mutation(() => String)
  @Roles(ROLE_ALL)
  @UseGuards(GqlJwtAuthGuard)
  async signout(
    @AuthUser() user: User,
    @AuthToken() token: string,
    @Args() args: SignOutArgs,
  ): Promise<string> {
    await this.authService.signout(user.id, args.refreshToken, token);
    return 'Success';
  }

  @Mutation(() => GqlAuth, { name: 'refresh' })
  @UseGuards(GqlJwtRefreshTokenGuard)
  async refreshToken(
    @AuthUser() user: User,
    @AuthToken() token: string,
  ): Promise<GqlAuth> {
    return this.authService.refreshAccessToken(user, token);
  }
}
