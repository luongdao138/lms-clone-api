import { ArgsType, Field } from '@nestjs/graphql';
import { VerifyOtpInput } from './VerifyOtp.input';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@ArgsType()
export class VerifyOtpArgs {
  @Field(() => VerifyOtpInput)
  @Type(() => VerifyOtpInput)
  @ValidateNested({ each: true })
  data: VerifyOtpInput;
}
