import { Injectable } from '@nestjs/common';
import { HealthServiceBase } from './base/health.service.base';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HealthService extends HealthServiceBase {
  constructor(protected readonly prismaService: PrismaService) {
    super(prismaService);
  }
}
