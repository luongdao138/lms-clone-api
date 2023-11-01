import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class VerifyOtpInput {
  @Field(() => String)
  @IsString()
  token: string;

  @Field(() => String)
  @IsString()
  otp: string;
}
