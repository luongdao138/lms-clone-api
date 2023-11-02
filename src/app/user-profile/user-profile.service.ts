import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TransactionBaseService } from 'src/nest/shared/transaction-base.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientTransaction } from 'src/types/common';

@Injectable()
export class UserProfileService extends TransactionBaseService {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

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
