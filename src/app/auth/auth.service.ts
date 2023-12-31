import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Redis } from 'ioredis';
import { pick } from 'lodash';
import { Environment } from 'src/constants/env';
import { ModuleName } from 'src/constants/module-names';
import { GraphQLException } from 'src/graphql/errors/GraphQLError';
import { ApolloServerErrorCode } from 'src/graphql/errors/error-codes';
import { RateLimitingService } from 'src/nest/shared/rate-limit/rate-limiting.service';
import { TransactionBaseService } from 'src/nest/shared/transaction-base.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RabbitMqService } from 'src/rabbitmq/rabbitmq.service';
import { generateRoutingKey } from 'src/rabbitmq/rabbitmq.util';
import { PrismaClientTransaction, TimeUnit } from 'src/types/common';
import { TimeUtil } from 'src/utils/time.util';
import { OtpService } from '../otp/otp.service';
import { PasswordService } from '../password/password.service';
import { UserProfileService } from '../user-profile/user-profile.service';
import { UserService } from '../user/user.service';
import { USER_EVENT, authOptions } from './auth.constant';
import { JwtPayload, JwtSavedToken } from './auth.interface';
import { GqlAuth } from './dto/Auth.gql';
import { LoginInput } from './dto/Login.input';
import { SignUpInput } from './dto/Signup.input';
import { VerifyOtpInput } from './dto/VerifyOtp.input';
import { UserResendOtpEvent } from './events/UserResendOtp.event';
import { UserSignupEvent } from './events/UserSignup.event';

@Injectable()
export class AuthService extends TransactionBaseService {
  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private readonly passwordService: PasswordService,
    private readonly userService: UserService,
    protected readonly prisma: PrismaService,
    @InjectRedis() private readonly redis: Redis,
    private readonly userProfileService: UserProfileService,
    private readonly rabbitMQService: RabbitMqService,
    private readonly otpService: OtpService,
    private readonly rateLimitingService: RateLimitingService,
  ) {
    super(prisma);
  }

  async signup(payload: SignUpInput) {
    return await this.withTransaction()(async (tx) => {
      const { email } = payload;
      const existingUser = await this.userService.findUserByEmail(email, tx);

      let user: User;

      if (existingUser && this.userService.isUserActive(existingUser)) {
        throw new GraphQLException(
          'Email already exists',
          ApolloServerErrorCode.BAD_REQUEST,
        );
      } else if (existingUser) {
        user = existingUser;
      } else {
        user = await this.signupNewUser(payload, tx);
      }

      const { otp, rawOtp } = await this.renewOtp(user.id, tx);

      // get the raw otp to send email
      otp.otp = rawOtp;

      await this.rabbitMQService.publish(
        generateRoutingKey(ModuleName.USER, USER_EVENT.SIGNUP),
        new UserSignupEvent(user, otp),
      );

      return { user, token: otp.otpToken };
    });
  }

  async login(payload: LoginInput): Promise<GqlAuth> {
    const { email, password } = payload;
    const existingUser = await this.userService.findUserByEmail(email);
    if (!existingUser || !this.userService.isUserActive(existingUser))
      throw new GraphQLException(
        'Email or password is not correct',
        ApolloServerErrorCode.BAD_REQUEST,
      );

    const isPasswordMatch = await this.passwordService.verify(
      password,
      existingUser.password,
    );
    if (!isPasswordMatch) {
      throw new GraphQLException(
        'Email or password is not correct',
        ApolloServerErrorCode.BAD_REQUEST,
      );
    }

    return this.prepareAuthTokens(existingUser);
  }

  async verifyOtp(
    payload: VerifyOtpInput,
    tx?: PrismaClientTransaction,
  ): Promise<User | undefined> {
    return this.withTransaction(tx)(async (tx) => {
      const { token, otp } = payload;

      const { success, otp: activeOtp } = await this.otpService.verifyOtp(
        otp,
        token,
        tx,
      );
      if (!success) {
        return;
      }

      const { id: otpId, userId } = activeOtp;

      await Promise.all([
        this.otpService.deleteOtp({ where: { id: otpId } }, tx),
        this.userService.activateUser(userId, tx),
      ]);

      return this.userService.findUser(userId, {}, tx);
    });
  }

  async renewOtp(userId: number, tx?: PrismaClientTransaction) {
    return this.withTransaction(tx)(async (prismaIntance) => {
      const exceedRateLimit = await this.rateLimitingService.bucket(
        this.getOtpRateLimitKey(userId),
        { accessLimit: 20, timeUnit: TimeUnit.HOUR }, // 20 otps per hours
      );
      if (exceedRateLimit) {
        throw new GraphQLException(
          'Too many otp requests. Try again later',
          ApolloServerErrorCode.TOO_MANY_REQUESTS,
        );
      }

      const activeOtp = await this.otpService.getActiveOtp(
        { userId },
        {},
        prismaIntance,
      );

      // remove current active otp
      if (activeOtp) {
        await this.otpService.deleteOtp(
          { where: { id: activeOtp.id } },
          prismaIntance,
        );
      }
      const { otp, rawOtp } = await this.otpService.createOtp(
        { userId: userId, expiresIn: authOptions.tokens.otpExpiresIn },
        prismaIntance,
      );

      return { otp, rawOtp };
    });
  }

  async resendOtp(token: string) {
    const activeToken = await this.otpService.verifyOtpToken(token);

    if (!activeToken) {
      throw new GraphQLException(
        'Token is invalid',
        ApolloServerErrorCode.BAD_REQUEST,
      );
    }

    const { userId } = activeToken;

    const { otp, rawOtp } = await this.renewOtp(userId);
    const user = await this.userService.findUser(userId);

    await this.rabbitMQService.publish(
      generateRoutingKey(ModuleName.USER, USER_EVENT.RESEND_OTP),
      new UserResendOtpEvent(user, { ...otp, otp: rawOtp }),
    );

    return { token: otp.otpToken };
  }

  async signupNewUser(payload: SignUpInput, tx?: PrismaClientTransaction) {
    return await this.withTransaction(tx)(
      async (prismaInstance: PrismaClientTransaction) => {
        const { email, password, ...rest } = payload;

        const hashedPassword = await this.passwordService.hash(password);

        // create new empty profile for user
        const userProfile = await this.userProfileService.createProfile(
          {
            data: {},
            select: {
              id: true,
            },
          },
          prismaInstance,
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
          prismaInstance,
        );

        return user;
      },
    );
  }

  getOtpRateLimitKey(userId: number) {
    return `${userId}:signup:otp`;
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

    const toDeleteAccessTokens = whiteListAccessTokens.filter(
      (rawToken) => !this.checkValidToken(rawToken),
    );
    const toDeleteRefreshTokens = whiteListRefreshTokens.filter(
      (rawToken) => !this.checkValidToken(rawToken),
    );

    const pipeline = this.redis.pipeline();

    if (toDeleteAccessTokens.length) {
      pipeline.srem(accessTokenKey, toDeleteAccessTokens);
    }
    if (toDeleteRefreshTokens.length) {
      pipeline.srem(refreshTokenKey, toDeleteRefreshTokens);
    }

    await pipeline.exec();
  }

  async prepareAuthTokens(user: User): Promise<GqlAuth> {
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
