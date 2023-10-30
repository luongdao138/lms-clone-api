import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Injectable()
export class RabbitMQHealthIndicator extends HealthIndicator {
  constructor(private readonly connection: AmqpConnection) {
    super();
  }

  async check(key: string): Promise<HealthIndicatorResult> {
    const isConnected = this.connection.connected;

    const result = this.getStatus(key, isConnected, {});
    if (isConnected) {
      return result;
    }

    throw new HealthCheckError('RabbitMQ is down', result);
  }
}
