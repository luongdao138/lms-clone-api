import { Injectable } from '@nestjs/common';
import { $Enums, Prisma, User } from '@prisma/client';
import { TransactionBaseService } from 'src/nest/shared/transaction-base.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientTransaction } from 'src/types/common';

@Injectable()
export class UserService extends TransactionBaseService {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

  async findUser(
    id: number,
    args: Omit<Prisma.UserFindUniqueArgs, 'where'> = {},
    tx?: PrismaClientTransaction,
  ) {
    const prismaInstance = tx ?? this.prisma;
    return prismaInstance.user.findUnique({ where: { id }, ...args });
  }

  async findUserByEmail(email: string, tx?: PrismaClientTransaction) {
    const prismaInstance = tx ?? this.prisma;
    return prismaInstance.user.findUnique({ where: { email } });
  }

  async createUser(args: Prisma.UserCreateArgs, tx?: PrismaClientTransaction) {
    const prismaInstance = tx ?? this.prisma;
    const user = await prismaInstance.user.create(args);

    return user;
  }

  async getAuthUser(
    where: Prisma.UserWhereInput,
    tx?: PrismaClientTransaction,
  ) {
    const prismaInstance = tx ?? this.prisma;
    const user = await prismaInstance.user.findFirst({
      where,
    });

    return user;
  }

  async activateUser(userId: number, tx?: PrismaClientTransaction) {
    const prismaInstance = tx ?? this.prisma;

    // temp update user status to active
    await prismaInstance.user.update({
      where: { id: userId },
      data: { status: $Enums.UserStatus.ACTIVE },
    });
  }

  isUserActive(user: User) {
    return user?.status === $Enums.UserStatus.ACTIVE;
  }
}
