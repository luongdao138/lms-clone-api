import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientTransaction } from 'src/types/common';

@Injectable()
export class UserProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async createProfile(
    args: Prisma.UserProfileCreateArgs,
    tx?: PrismaClientTransaction,
  ) {
    const prismaInstance = tx ?? this.prisma;
    return prismaInstance.userProfile.create(args);
  }

  async getProfile(
    args: Prisma.UserProfileFindUniqueArgs,
    tx?: PrismaClientTransaction,
  ) {
    const prismaInstance = tx ?? this.prisma;
    return prismaInstance.userProfile.findUnique(args);
  }
}
