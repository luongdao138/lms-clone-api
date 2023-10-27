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

  async signout(userId: number, refreshToken: string, accessToken: string) {
    await Promise.all([
      this.revokeJwtTokens(
        `${authOptions.tokens.whiteListRefreshTokenPrefix}${userId}`,
        [refreshToken],
      ),
      this.revokeJwtTokens(
        `${authOptions.tokens.whiteListAccessTokenPrefix}${userId}`,
        [accessToken],
      ),
    ]);
  }

  async refreshAccessToken(user: User, refreshToken: string) {
    await this.revokeJwtTokens(
      `${authOptions.tokens.whiteListRefreshTokenPrefix}${user.id}`,
      [refreshToken],
    );

    return this.prepareAuthTokens(user);
  }

  generateJwtPayload(user: User): JwtPayload {
    return {
      ...pick(user, ['id', 'email', 'role']),
    };
  }

  async retrieveJwtTokens(key: string) {
    return (await this.redis.smembers(key)) ?? [];
  }

  async saveJwtToken(token: string, key: string, expiresIn: number) {
    const data = {
      token,
      expiresIn: new Date(new Date().getTime() + expiresIn * 1000).getTime(),
    };

    await this.redis.sadd(key, JSON.stringify(data));
  }

  async revokeJwtTokens(key: string, tokens?: string[]) {
    if (!tokens) {
      await this.redis.del(key);
    } else {
      const currentTokens = await this.retrieveJwtTokens(key);

      const toDeleteTokens = currentTokens.filter(async (rawToken) => {
        const parsedToken = JSON.parse(rawToken) as JwtSavedToken;
        return tokens.includes(parsedToken.token);
      });

      toDeleteTokens.length > 0 &&
        (await this.redis.srem(key, ...toDeleteTokens));
    }
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

  async validateJwtToken({
    token,
    userId,
    key,
  }: {
    token: string;
    userId: number;
    key: string;
  }): Promise<boolean> {
    const whiteListTokens = await this.retrieveJwtTokens(`${key}${userId}`);

    return whiteListTokens.some((rawToken) => {
      const parsedToken = JSON.parse(rawToken) as JwtSavedToken;

      return (
        parsedToken.token === token &&
        TimeUtil.isBefore(new Date(), parsedToken.expiresIn)
      );
    });
  }
}
