import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from '@prisma/client';
import { ROLE_ALL } from 'src/constants/role';
import { GraphQLException } from 'src/graphql/errors/GraphQLError';
import { ApolloServerErrorCode } from 'src/graphql/errors/error-codes';
import { GqlUser } from 'src/graphql/models/User.gql';
import { AuthToken } from 'src/nest/decorators/auth-token.decorator';
import { Public } from 'src/nest/decorators/public.decorator';
import { Roles } from 'src/nest/decorators/role.decorator';
import { AuthUser } from 'src/nest/decorators/user.decorator';
import { AuthService } from './auth.service';
import { GqlAuth } from './dto/Auth.gql';
import { LoginArgs } from './dto/Login.args';
import { SignOutArgs } from './dto/Signout.args';
import { SignUpArgs } from './dto/Signup.args';
import { GqlSignup } from './dto/Signup.gql';
import { VerifyOtpArgs } from './dto/VerifyOtp.args';
import { GqlVerifyOtp } from './dto/VerifyOtp.gql';
import { GqlJwtRefreshTokenGuard } from './guards/gql-jwt-refresh-token.guard';
import { GqlJwtAuthGuard } from './guards/gql-jwt.guard';

@Resolver(() => GqlAuth)
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
  async verifyOtp(@Args() args: VerifyOtpArgs): Promise<{ user: User }> {
    const user = await this.authService.verifyOtp(args.data);
    if (!user) {
      throw new GraphQLException(
        'Otp or token is invalid',
        ApolloServerErrorCode.BAD_REQUEST,
      );
    }

    return { user };
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
