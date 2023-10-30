import { BaseEvent } from 'src/types/BaseEvent';
import { USER_EVENT } from '../auth.constant';
import { User } from '@prisma/client';

export class UserSignupEvent extends BaseEvent {
  constructor(public user: User) {
    super(USER_EVENT.SIGNUP);
  }
}
