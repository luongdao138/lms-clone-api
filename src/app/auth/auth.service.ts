import { HttpException, Injectable } from '@nestjs/common';
import { PasswordService } from '../password/password.service';
import { UserService } from '../user/user.service';
import { SignUpInput } from './dto/Signup.input';
import { LoginInput } from './dto/Login.input';
import { Auth } from 'src/graphql/models/Auth';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Environment } from 'src/constants/env';
import { User } from 'src/graphql/models/User';
import { pick } from 'lodash';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Redis } from 'ioredis';
import { authOptions } from './auth.constant';
import { JwtPayload, JwtSavedToken } from './auth.interface';
import { TimeUtil } from 'src/utils/time.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly userService: UserService,
    @InjectRedis() private readonly redis: Redis,
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

    return this.prepareAuthTokens(existingUser);
  }

  generateJwtPayload(user: User): JwtPayload {
    return {
      ...pick(user, ['id', 'email', 'role']),
    };
  }

  async saveJwtToken(token: string, key: string, expiresIn: number) {
    const data = {
      token,
      expiresIn: new Date(new Date().getTime() + expiresIn * 1000).getTime(),
    };

    await this.redis.sadd(key, JSON.stringify(data));
  }

  async prepareAuthTokens(user: User): Promise<Auth> {
    const jwtPayload = this.generateJwtPayload(user);

    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: this.configService.getOrThrow(Environment.ACCESS_TOKEN_SECRET),
      expiresIn: authOptions.tokens.accessExpiresIn,
    });

    const refreshToken = this.jwtService.sign(jwtPayload, {
      secret: this.configService.getOrThrow(Environment.REFRESH_TOKEN_SECRET),
      expiresIn: authOptions.tokens.refreshExpiresIn,
    });

    await Promise.all([
      this.saveJwtToken(
        accessToken,
        `${authOptions.tokens.whiteListAccessTokenPrefix}${user.id}`,
        authOptions.tokens.accessExpiresIn,
      ),
      this.saveJwtToken(
        refreshToken,
        `${authOptions.tokens.whiteListRefreshTokenPrefix}${user.id}`,
        authOptions.tokens.refreshExpiresIn,
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateAccessToken({
    token,
    userId,
  }: {
    token: string;
    userId: number;
  }): Promise<boolean> {
    const whiteListAccessTokens =
      (await this.redis.smembers(
        `${authOptions.tokens.whiteListAccessTokenPrefix}${userId}`,
      )) ?? [];

    return whiteListAccessTokens.some((rawToken) => {
      const parsedToken = JSON.parse(rawToken) as JwtSavedToken;

      return (
        parsedToken.token === token &&
        TimeUtil.isBefore(new Date(), parsedToken.expiresIn)
      );
    });
  }
}
