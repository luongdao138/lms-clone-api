import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Auth } from 'src/graphql/models/Auth';
import { SignUpArgs } from './dto/Signup.args';
import { UseFilters } from '@nestjs/common';
import { GqlResolverExceptionsFilter } from 'src/nest/filters/gql-exception.filter';
import { AuthService } from './auth.service';

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
}
