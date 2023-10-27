import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Auth } from 'src/graphql/models/Auth';
import { User } from 'src/graphql/models/User';
import { AuthToken } from 'src/nest/decorators/auth-token.decorator';
import { AuthUser } from 'src/nest/decorators/user.decorator';
import { GqlResolverExceptionsFilter } from 'src/nest/filters/gql-exception.filter';
import { AuthService } from './auth.service';
import { LoginArgs } from './dto/Login.args';
import { SignOutArgs } from './dto/Signout.args';
import { SignUpArgs } from './dto/Signup.args';
import { GqlJwtAuthGuard } from './guards/gql-jwt.guard';

@Resolver(() => Auth)
@UseFilters(GqlResolverExceptionsFilter)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => String)
  async signup(@Args({ nullable: false }) args: SignUpArgs): Promise<string> {
    const { data } = args;

    await this.authService.signup(data);
    return 'Success';
  }

  @Mutation(() => Auth)
  async login(@Args({ nullable: false }) args: LoginArgs): Promise<Auth> {
    const { data } = args;

    const tokens = await this.authService.login(data);
    return tokens;
  }

  @Query(() => User)
  @UseGuards(GqlJwtAuthGuard)
  async me(@AuthUser() user: User): Promise<User> {
    return user;
  }

  @Mutation(() => String)
  @UseGuards(GqlJwtAuthGuard)
  async signout(
    @AuthUser() user: User,
    @AuthToken() token: string,
    @Args() args: SignOutArgs,
  ): Promise<string> {
    await this.authService.signout(user.id, args.refreshToken, token);
    return 'Success';
  }
}
