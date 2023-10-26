import { Mutation, Resolver } from '@nestjs/graphql';
import { Auth } from 'src/graphql/models/Auth';

@Resolver(() => Auth)
export class AuthResolver {
  @Mutation(() => Auth)
  async signup(): Promise<Auth> {
    return {
      token: '123',
    };
  }
}
