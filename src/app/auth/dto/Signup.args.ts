import { ArgsType, Field } from '@nestjs/graphql';
import { SignUpInput } from './Signup.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class SignUpArgs {
  @Field(() => SignUpInput, { nullable: false })
  @Type(() => SignUpInput)
  @ValidateNested({ each: true })
  data!: SignUpInput;
}
