import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMqService {
  constructor(private readonly configService: ConfigService) {}
}
