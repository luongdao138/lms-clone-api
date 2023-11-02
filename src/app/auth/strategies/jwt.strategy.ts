import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { $Enums } from '@prisma/client';
import { Request } from 'express';
import { omit } from 'lodash';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/app/user/user.service';
import { Environment } from 'src/constants/env';
import { GraphQLException } from 'src/graphql/errors/GraphQLError';
import { ApolloServerErrorCode } from 'src/graphql/errors/error-codes';
import { authOptions } from '../auth.constant';
import { JwtPayload } from '../auth.interface';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    protected readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
    super({
      passReqToCallback: true,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow(Environment.ACCESS_TOKEN_SECRET),
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const { id } = payload;

    // check if access token is in whitelist (redis)
    const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const isValid = await this.authService.validateJwtToken({
      userId: id,
      token: jwt,
      key: authOptions.tokens.whiteListAccessTokenPrefix,
    });

    if (!isValid) {
      throw new GraphQLException(
        'Unauthorized',
        ApolloServerErrorCode.UNAUTHORIZED,
      );
    }

    // enrich the req.user with whole user entity
    const user = await this.userService.getAuthUser({
      id,
    });

    if (user.status !== $Enums.UserStatus.ACTIVE) {
      throw new GraphQLException(
        'Unauthorized',
        ApolloServerErrorCode.UNAUTHORIZED,
      );
    }

    return omit(user, ['password']);
  }
}
