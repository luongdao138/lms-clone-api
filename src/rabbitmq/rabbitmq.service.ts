import { ModuleConfigFactory } from '@golevelup/nestjs-modules';
import { RabbitMQConfig } from '@golevelup/nestjs-rabbitmq';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from 'src/constants/env';
import { DEFAULT_CHANNEL, exchanges } from './rabbitmq.constant';

@Injectable()
export class RabbitMqService implements ModuleConfigFactory<RabbitMQConfig> {
  constructor(private readonly configService: ConfigService) {}

  createModuleConfig(): RabbitMQConfig {
    return {
      uri: this.configService.getOrThrow<string>(Environment.RABBITMQ_URL),
      connectionInitOptions: {
        wait: false,
      },
      channels: {
        [DEFAULT_CHANNEL]: {
          default: true,
        },
      },
      exchanges,
    };
  }
}
