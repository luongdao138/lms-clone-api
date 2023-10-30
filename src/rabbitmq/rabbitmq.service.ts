import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitmqService {
  constructor(private readonly configService: ConfigService) {}
}
