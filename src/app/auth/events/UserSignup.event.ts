import { BaseEvent } from 'src/types/BaseEvent';
import { USER_EVENT } from '../auth.constant';
import { Otp, User } from '@prisma/client';

export class UserSignupEvent extends BaseEvent {
  constructor(public user: User, public otp: Otp) {
    super(USER_EVENT.SIGNUP, { user, otp });
  }
}
