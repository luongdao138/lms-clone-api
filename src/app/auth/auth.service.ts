import { HttpException, Injectable } from '@nestjs/common';
import { PasswordService } from '../password/password.service';
import { UserService } from '../user/user.service';
import { SignUpInput } from './dto/Signup.input';
import { LoginInput } from './dto/Login.input';
import { Auth } from 'src/graphql/models/Auth';

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

  async login(payload: LoginInput): Promise<Auth> {
    const { email, password } = payload;
    const existingUser = await this.userService.findUserByEmail(email);
    if (!existingUser)
      throw new HttpException('Email or password is not correct', 400);

    const isPasswordMatch = await this.passwordService.verify(
      password,
      existingUser.password,
    );
    if (!isPasswordMatch) {
      throw new HttpException('Email or password is not correct', 400);
    }

    return {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    };
  }
}
