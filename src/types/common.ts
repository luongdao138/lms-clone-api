import { Prisma, PrismaClient, User } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { Request } from 'express';

export interface GqlContext {
  req: Request & { user: User };
}

export type PrismaClientTransaction = Omit<
  PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
