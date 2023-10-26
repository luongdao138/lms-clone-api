import { Controller } from '@nestjs/common';
import { HealthBaseController } from './base/health.controller.base';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController extends HealthBaseController {
  constructor(protected readonly healthService: HealthService) {
    super(healthService);
  }
}
