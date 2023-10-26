import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Auth } from 'src/graphql/models/Auth';
import { SignUpArgs } from './dto/Signup.args';
import { UseFilters } from '@nestjs/common';
import { GqlResolverExceptionsFilter } from 'src/nest/filters/gql-exception.filter';

@Resolver(() => Auth)
@UseFilters(GqlResolverExceptionsFilter)
export class AuthResolver {
  @Mutation(() => Auth)
  async signup(@Args({ nullable: false }) args: SignUpArgs): Promise<Auth> {
    return {
      token: '123',
    };
  }
}
