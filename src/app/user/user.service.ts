import { Injectable } from '@nestjs/common';
import { $Enums, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientTransaction } from 'src/types/common';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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
}
