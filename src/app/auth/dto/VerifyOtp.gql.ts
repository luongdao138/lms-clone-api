import { Field, ObjectType } from '@nestjs/graphql';
import { GqlUser } from 'src/graphql/models/User.gql';

@ObjectType()
export class GqlVerifyOtp {
  @Field(() => GqlUser, { nullable: false })
  user: GqlUser;
}
