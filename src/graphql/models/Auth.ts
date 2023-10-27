import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Auth {
  @Field({ nullable: false })
  refreshToken: string;

  @Field({ nullable: false })
  accessToken: string;
}
