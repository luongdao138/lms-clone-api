import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientTransaction } from 'src/types/common';

export class TransactionBaseService {
  constructor(protected prisma: PrismaService) {}

  withTransaction(tx?: PrismaClientTransaction) {
    return tx
      ? async <T = any>(
          callback: (prisma: PrismaClientTransaction) => Promise<T>,
        ) => await callback(tx)
      : async <T = any>(
          callback: (prisma: PrismaClientTransaction) => Promise<T>,
        ) =>
          await this.prisma.$transaction(
            async (transaction) => await callback(transaction),
          );
  }
}
