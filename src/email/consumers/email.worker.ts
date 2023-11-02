import { Injectable } from '@nestjs/common';
import { EmailService } from '../email.service';
import { USER_EVENT } from 'src/app/auth/auth.constant';
import { Otp, User } from '@prisma/client';
import { EMAIL_TEMPLATE } from '../email.constant';
import { TimeUtil } from 'src/utils/time.util';

@Injectable()
export class EmailWorker {
  constructor(private emailService: EmailService) {}

  async handleEmailEvents(eventName: string, data: any) {
    switch (eventName) {
      case USER_EVENT.SIGNUP:
        await this.handleUserSignup(data);
        break;
      default:
        break;
    }
  }

  private async handleUserSignup(data: { user: User; otp: Otp }) {
    const { user, otp } = data;
    await this.emailService.send({
      to: data.user.email,
      subject: `User signup`,
      template: EMAIL_TEMPLATE.USER_SIGN_UP,
      context: {
        otp: otp.otp,
        email: user.email,
        expiresIn: TimeUtil.diff(otp.createdAt, otp.expiresAt, 'minute'),
      },
    });
  }
}
