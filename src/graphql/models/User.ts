import { Field, ObjectType } from '@nestjs/graphql';
import { $Enums, User as PrismaUser } from '@prisma/client';
import { Exclude } from 'class-transformer';

@ObjectType({
  isAbstract: true,
})
export class User implements PrismaUser {
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
}
