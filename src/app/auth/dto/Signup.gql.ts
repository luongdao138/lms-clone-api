import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GqlSignup {
  @Field(() => String)
  token: string;
}
