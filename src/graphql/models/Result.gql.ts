import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
  isAbstract: true,
})
export class GqlResult {
  @Field(() => Boolean, { nullable: false })
  success: boolean;
}
