import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientTransaction } from 'src/types/common';
import { TimeUtil } from 'src/utils/time.util';
import { generate as generateOtp } from 'otp-generator';
import { CreateOtpInput } from './otp.types';
import { OtpOptions, OtpPayload } from './otp.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Environment } from 'src/constants/env';
import { OTP_OPTIONS } from './otp.constant';
import { UserService } from '../user/user.service';
import { Otp, Prisma, User } from '@prisma/client';
import { JwtPayload } from '../auth/auth.interface';

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private configService: ConfigService,
    @Inject(OTP_OPTIONS)
    private readonly options: OtpOptions,
    private readonly userService: UserService,
  ) {}

  async createOtp(input: CreateOtpInput, tx?: PrismaClientTransaction) {
    const prismaInstance = tx ?? this.prisma;

    input.expiresIn |= 5 * 60; // default 5 minutes
    const expiresAt = TimeUtil.add(input.expiresIn * 1000).toDate();
    const newOtp = generateOtp(
      this.options.length,
      this.options.generateOptions,
    );
    const user = await this.userService.findUser(
      input.userId,
      { select: { id: true, email: true } },
      tx,
    );

    const otpToken = this.jwtService.sign(this.genOtpPayload(user), {
      expiresIn: input.expiresIn,
      secret: this.configService.getOrThrow(Environment.OTP_SECRET),
    });

    return prismaInstance.otp.create({
      data: {
        userId: input.userId,
        expiresAt,
        otp: newOtp,
        otpToken,
      },
    });
  }

  async getActiveOtp(
    where: Prisma.OtpFindFirstArgs['where'],
    args: Omit<Prisma.OtpFindFirstArgs, 'where'> = {},
    tx?: PrismaClientTransaction,
  ) {
    const prismaInstance = tx ?? this.prisma;

    return prismaInstance.otp.findFirst({
      where: { ...where, expiresAt: { gt: new Date() } },
      ...args,
    });
  }

  async verifyOtp(
    otp: string,
    token: string,
    tx?: PrismaClientTransaction,
  ): Promise<{ success: boolean; otp: Otp | undefined }> {
    let otpPayload: OtpPayload;

    try {
      otpPayload = await this.jwtService.verifyAsync<OtpPayload>(token, {
        secret: this.configService.getOrThrow(Environment.OTP_SECRET),
      });
    } catch (error) {
      return { success: false, otp: undefined };
    }

    const userId = otpPayload.id;
    const activeOtp = await this.getActiveOtp(
      { otpToken: token, otp, userId },
      {},
      tx,
    );
    if (!activeOtp) return { success: false, otp: undefined };

    return { success: true, otp: activeOtp };
  }

  async deleteOtp(args: Prisma.OtpDeleteArgs, tx?: PrismaClientTransaction) {
    const prismaInstance = tx ?? this.prisma;

    return prismaInstance.otp.delete(args);
  }

  private genOtpPayload(user: User): OtpPayload {
    return { id: user.id, email: user.email };
  }
}
