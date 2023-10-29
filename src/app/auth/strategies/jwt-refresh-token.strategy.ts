import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Environment } from 'src/constants/env';
import { JwtPayload } from '../auth.interface';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { authOptions } from '../auth.constant';
import { UserService } from 'src/app/user/user.service';
import { $Enums } from '@prisma/client';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    protected readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    super({
      passReqToCallback: true,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow(Environment.REFRESH_TOKEN_SECRET),
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const { id } = payload;

    // check if refresh token is in whitelist (redis)
    const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const isValid = await this.authService.validateJwtToken({
      userId: id,
      token: jwt,
      key: authOptions.tokens.whiteListRefreshTokenPrefix,
    });

    if (!isValid) {
      // reuse-token => remove all tokens
      await Promise.all([
        this.authService.revokeJwtTokens(this.authService.generateTokenKey(id)),
        this.authService.revokeJwtTokens(
          this.authService.generateTokenKey(id, 'refresh'),
        ),
      ]);
      throw new UnauthorizedException();
    }

    const user = await this.userService.getAuthUser({
      id,
    });

    if (user.status !== $Enums.UserStatus.ACTIVE) {
      throw new UnauthorizedException();
    }

    // enrich the req.user with whole user entity
    return user;
  }
}
