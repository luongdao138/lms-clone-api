import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Redis } from 'ioredis';
import { pick } from 'lodash';
import { Environment } from 'src/constants/env';
import { ModuleName } from 'src/constants/module-names';
import { Auth } from 'src/graphql/models/Auth';
import { PrismaService } from 'src/prisma/prisma.service';
import { RabbitMqService } from 'src/rabbitmq/rabbitmq.service';
import { generateRoutingKey } from 'src/rabbitmq/rabbitmq.util';
import { TimeUtil } from 'src/utils/time.util';
import { PasswordService } from '../password/password.service';
import { UserProfileService } from '../user-profile/user-profile.service';
import { UserService } from '../user/user.service';
import { USER_EVENT, authOptions } from './auth.constant';
import { JwtPayload, JwtSavedToken } from './auth.interface';
import { LoginInput } from './dto/Login.input';
import { SignUpInput } from './dto/Signup.input';
import { UserSignupEvent } from './events/UserSignup.event';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly userService: UserService,
    private prisma: PrismaService,
    @InjectRedis() private readonly redis: Redis,
    private readonly userProfileService: UserProfileService,
    private readonly rabbitMQService: RabbitMqService,
  ) {}

  async signup(payload: SignUpInput): Promise<User> {
    return await this.prisma.$transaction(async (tx) => {
      const { email, password, ...rest } = payload;
      const existingUser = await this.userService.findUserByEmail(email, tx);

      if (existingUser) throw new HttpException('Email already exists', 422);
      const hashedPassword = await this.passwordService.hash(password);

      // create new empty profile for user
      const userProfile = await this.userProfileService.createProfile(
        {
          data: {},
          select: {
            id: true,
          },
        },
        tx,
      );

      const user = await this.userService.createUser(
        {
          data: {
            email,
            password: hashedPassword,
            profileId: userProfile.id,
            ...rest,
          },
        },
        tx,
      );

      await this.rabbitMQService.publish(
        generateRoutingKey(ModuleName.USER, USER_EVENT.SIGNUP),
        new UserSignupEvent(user),
      );

      return user;
    });
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
      this.revokeJwtTokens(this.generateTokenKey(userId), [accessToken]),
      this.revokeJwtTokens(this.generateTokenKey(userId, 'refresh'), [
        refreshToken,
      ]),
    ]);
  }

  async refreshAccessToken(user: User, refreshToken: string) {
    await this.revokeJwtTokens(this.generateTokenKey(user.id, 'refresh'), [
      refreshToken,
    ]);

    return this.prepareAuthTokens(user);
  }

  generateJwtPayload(user: User): JwtPayload {
    return {
      ...pick(user, ['id', 'email', 'role']),
    };
  }

  generateTokenKey(userId: number, type: 'access' | 'refresh' = 'access') {
    let prefix = '';

    switch (type) {
      case 'access':
        prefix = authOptions.tokens.whiteListAccessTokenPrefix;
        break;
      case 'refresh':
        prefix = authOptions.tokens.whiteListRefreshTokenPrefix;
        break;
      default:
        break;
    }

    return `${prefix}${userId}`;
  }

  checkValidToken(rawToken: string, comparedToken?: string): boolean {
    const parsedToken = JSON.parse(rawToken) as JwtSavedToken;

    const isNotExpired = TimeUtil.isBefore(new Date(), parsedToken.expiresIn);
    if (!comparedToken) return isNotExpired;

    return isNotExpired && comparedToken === parsedToken.token;
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

      const toDeleteTokens = currentTokens.filter((rawToken) => {
        const parsedToken = JSON.parse(rawToken) as JwtSavedToken;
        return tokens.includes(parsedToken.token);
      });

      toDeleteTokens.length > 0 &&
        (await this.redis.srem(key, ...toDeleteTokens));
    }
  }

  async revokeExpiredJwtTokens(userId: number) {
    const accessTokenKey = this.generateTokenKey(userId);
    const refreshTokenKey = this.generateTokenKey(userId, 'refresh');

    const [whiteListAccessTokens, whiteListRefreshTokens] = await Promise.all([
      this.retrieveJwtTokens(accessTokenKey),
      this.retrieveJwtTokens(refreshTokenKey),
    ]);

    const promises = [];

    const toDeleteAccessTokens = whiteListAccessTokens.filter(
      (rawToken) => !this.checkValidToken(rawToken),
    );
    const toDeleteRefreshTokens = whiteListRefreshTokens.filter(
      (rawToken) => !this.checkValidToken(rawToken),
    );

    if (toDeleteAccessTokens.length) {
      promises.push(this.redis.srem(accessTokenKey, toDeleteAccessTokens));
    }
    if (toDeleteRefreshTokens.length) {
      promises.push(this.redis.srem(refreshTokenKey, toDeleteRefreshTokens));
    }

    await Promise.all(promises);
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

    const promises = [
      this.revokeExpiredJwtTokens(user.id),
      this.saveJwtToken(
        accessToken,
        this.generateTokenKey(user.id),
        authOptions.tokens.accessExpiresIn,
      ),
      this.saveJwtToken(
        refreshToken,
        this.generateTokenKey(user.id, 'refresh'),
        authOptions.tokens.refreshExpiresIn,
      ),
    ];
    await Promise.all(promises);

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

    return whiteListTokens.some((rawToken) =>
      this.checkValidToken(rawToken, token),
    );
  }
}
