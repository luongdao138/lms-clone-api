import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class SignUpInput {
  @Field({ nullable: false })
  @IsEmail()
  email: string;

  @Field({ nullable: false })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @Field({ nullable: false })
  @IsString()
  @IsNotEmpty()
  username: string;
}
