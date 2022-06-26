import { Controller, Get, HttpCode } from '@nestjs/common';

import { PingService } from '../application/ping.service';
import type { Ping } from '../domain/ping';

@Controller('ping')
export class PingController {
  constructor(private pingService: PingService) {}

  @Get()
  @HttpCode(200)
  getPing(): Ping {
    return this.pingService.getPing();
  }
}
