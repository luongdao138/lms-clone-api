import { BaseEvent } from 'src/types/BaseEvent';
import { USER_EVENT } from '../auth.constant';
import { Otp, User } from '@prisma/client';

export class UserResendOtpEvent extends BaseEvent {
  constructor(public user: User, public otp: Otp) {
    super(USER_EVENT.RESEND_OTP, { user, otp });
  }
}
