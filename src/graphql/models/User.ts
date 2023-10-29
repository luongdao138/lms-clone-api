import { Field, ObjectType } from '@nestjs/graphql';
import { $Enums, User as PrismaUser } from '@prisma/client';
import { Exclude } from 'class-transformer';
import { GqlUserProfile } from './UserProfile';

@ObjectType({
  isAbstract: true,
})
export class GqlUser implements PrismaUser {
  @Field(() => $Enums.UserStatus, { nullable: false })
  status: $Enums.UserStatus;

  @Field(() => Number, { nullable: false })
  profileId: number;

  @Field(() => Number, { nullable: false })
  id: number;

  @Field(() => String, { nullable: true })
  username: string;

  @Field(() => String, { nullable: false })
  email: string;

  @Exclude({})
  password: string;

  @Field(() => $Enums.UserRole, { nullable: false })
  role: $Enums.UserRole;

  @Exclude({})
  createdAt: Date;

  @Exclude({})
  updatedAt: Date;

  @Exclude({})
  deletedAt: Date;

  createdBy: number;

  updatedBy: number;

  deletedBy: number;

  // resolved fields
  @Field(() => GqlUserProfile, { nullable: false })
  profile: GqlUserProfile;
}
