import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GqlAuth {
  @Field({ nullable: false })
  refreshToken: string;

  @Field({ nullable: false })
  accessToken: string;
}
