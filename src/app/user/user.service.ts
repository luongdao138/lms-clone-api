import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserByEmail(email: string) {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async createUser(args: Prisma.UserCreateArgs) {
    const user = await this.prismaService.user.create(args);

    return user;
  }

  async getAuthUser(where: Prisma.UserWhereInput) {
    const user = await this.prismaService.user.findFirst({
      where,
    });

    return user;
  }
}
