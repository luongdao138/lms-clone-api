import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Auth {
  @Field({ description: 'JWT Bearer Token', nullable: false })
  token: string;
}
