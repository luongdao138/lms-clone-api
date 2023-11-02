import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class VerifyOtpInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  token: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  otp: string;
}
