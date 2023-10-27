import { ArgsType, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { LoginInput } from './Login.input';

@ArgsType()
export class LoginArgs {
  @Field(() => LoginInput, { nullable: false })
  @Type(() => LoginInput)
  @ValidateNested({ each: true })
  data: LoginInput;
}
