import { InputType, PickType } from '@nestjs/graphql';
import { SignUpInput } from './Signup.input';

@InputType()
export class LoginInput extends PickType(SignUpInput, ['email', 'password']) {}
