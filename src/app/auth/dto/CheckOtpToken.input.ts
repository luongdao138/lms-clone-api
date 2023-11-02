import { InputType, PickType } from '@nestjs/graphql';
import { VerifyOtpInput } from './VerifyOtp.input';

@InputType()
export class CheckOtpTokenInput extends PickType(VerifyOtpInput, ['token']) {}
