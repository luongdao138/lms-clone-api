import { HttpException, Injectable } from '@nestjs/common';
import { PasswordService } from '../password/password.service';
import { UserService } from '../user/user.service';
import { SignUpInput } from './dto/Signup.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly passwordService: PasswordService,
    private readonly userService: UserService,
  ) {}

  async signup(payload: SignUpInput) {
    const { email, password, ...rest } = payload;
    const existingUser = await this.userService.findUserByEmail(email);

    if (existingUser) throw new HttpException('Email already exists', 422);
    const hashedPassword = await this.passwordService.hash(password);

    const user = await this.userService.createUser({
      data: {
        email,
        password: hashedPassword,
        ...rest,
      },
    });

    return user;
  }
}
