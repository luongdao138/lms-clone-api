import { Field, ObjectType } from '@nestjs/graphql';
import { UserProfile as PrismaUserProfile } from '@prisma/client';
@ObjectType({
  isAbstract: true,
})
export class GqlUserProfile implements PrismaUserProfile {
  @Field(() => Number, { nullable: false })
  id: number;

  @Field(() => String, { nullable: true })
  firstname: string;

  @Field(() => String, { nullable: true })
  lastname: string;

  @Field(() => String, { nullable: true })
  avatar: string;

  @Field(() => String, { nullable: true })
  intro: string;

  @Field(() => String, { nullable: true })
  headline: string;

  createdAt: Date;

  updatedAt: Date;

  deletedAt: Date;

  createdBy: number;

  updatedBy: number;

  deletedBy: number;
}
