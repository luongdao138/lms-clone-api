import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class GqlHealthInfoDetail {
  @Field(() => String)
  status: string;
}

@ObjectType()
export class GqlHealthInfo {
  @Field(() => GqlHealthInfoDetail, { nullable: true })
  redis: GqlHealthInfoDetail;

  @Field(() => GqlHealthInfoDetail, { nullable: true })
  prisma: GqlHealthInfoDetail;

  @Field(() => GqlHealthInfoDetail, { nullable: true })
  rabbitmq: GqlHealthInfoDetail;
}

@ObjectType()
export class GqlHealth {
  @Field(() => String)
  status: string;

  @Field(() => GqlHealthInfo)
  info: GqlHealthInfo;

  @Field(() => GqlHealthInfo)
  details: GqlHealthInfo;

  @Field(() => GqlHealthInfo, { nullable: true })
  errors: GqlHealthInfo;
}
