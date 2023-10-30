import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserSignupRole } from 'src/graphql/enums/UserRole';

@InputType()
export class SignUpInput {
  @Field({ nullable: false })
  @IsEmail()
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;

  @Field({ nullable: false })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  username: string;

  @Field(() => UserSignupRole)
  @IsEnum(UserSignupRole, { always: true })
  role: UserSignupRole;
}
