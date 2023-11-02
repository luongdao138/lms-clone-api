import { ArgsType, Field } from '@nestjs/graphql';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CheckOtpTokenInput } from './CheckOtpToken.input';

@ArgsType()
export class CheckOtpTokenArgs {
  @Field(() => CheckOtpTokenInput)
  @Type(() => CheckOtpTokenInput)
  @ValidateNested({ each: true })
  data: CheckOtpTokenInput;
}
