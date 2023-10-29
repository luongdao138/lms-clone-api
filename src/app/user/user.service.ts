import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientTransaction } from 'src/types/common';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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
}
