import { Inject, Injectable, Optional } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientTransaction } from 'src/types/common';
import { TimeUtil } from 'src/utils/time.util';
import { generate as generateOtp } from 'otp-generator';
import { CreateOtpInput } from './otp.types';
import { OtpOptions } from './otp.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Environment } from 'src/constants/env';
import { OTP_OPTIONS } from './otp.constant';

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    @Inject(OTP_OPTIONS)
    private readonly options: OtpOptions,
  ) {}

  async createOtp(input: CreateOtpInput, tx?: PrismaClientTransaction) {
    const prismaInstance = tx ?? this.prisma;

    input.expiresIn |= 5 * 60; // default 5 minutes
    const expiresAt = TimeUtil.add(input.expiresIn * 1000).toDate();
    const newOtp = generateOtp(
      this.options.length,
      this.options.generateOptions,
    );
    const user = await prismaInstance.user.findUniqueOrThrow({
      where: { id: input.userId },
      select: { id: true, email: true },
    });
    const otpToken = this.jwtService.sign(
      { id: user.id, email: user.email },
      {
        expiresIn: input.expiresIn,
        secret: this.configService.getOrThrow(Environment.OTP_SECRET),
      },
    );

    return prismaInstance.otp.create({
      data: {
        userId: input.userId,
        expiresAt,
        otp: newOtp,
        otpToken,
      },
    });
  }
}
