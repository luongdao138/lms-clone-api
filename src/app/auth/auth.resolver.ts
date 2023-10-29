import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth } from 'src/graphql/models/Auth';
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
import { GqlUser } from 'src/graphql/models/User';
import { User } from '@prisma/client';

@Resolver(() => Auth)
@UseFilters(GqlResolverExceptionsFilter)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => String)
  async signup(@Args({ nullable: false }) args: SignUpArgs): Promise<string> {
    const { data } = args;

    await this.authService.signup(data);
    return 'Success';
  }

  @Public()
  @Mutation(() => Auth)
  async login(@Args({ nullable: false }) args: LoginArgs): Promise<Auth> {
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

  @Mutation(() => Auth, { name: 'refresh' })
  @UseGuards(GqlJwtRefreshTokenGuard)
  async refreshToken(
    @AuthUser() user: User,
    @AuthToken() token: string,
  ): Promise<Auth> {
    return this.authService.refreshAccessToken(user, token);
  }
}
