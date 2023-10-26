import { Get, HttpStatus, Res } from '@nestjs/common';
import { HealthService } from '../health.service';
import { Response } from 'express';

export class HealthBaseController {
  constructor(protected healthService: HealthService) {}

  @Get('live')
  healthLive(@Res() res: Response) {
    return res.status(HttpStatus.NO_CONTENT).end();
  }

  @Get('ready')
  async healthReady(@Res() res: Response) {
    const isDbReady = await this.healthService.isDbReady();

    if (!isDbReady) {
      return res.status(HttpStatus.NOT_FOUND).end();
    }

    return res.status(HttpStatus.NO_CONTENT).end();
  }
}
