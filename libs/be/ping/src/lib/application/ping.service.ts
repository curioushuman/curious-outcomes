import { Injectable } from '@nestjs/common';

import type { Ping } from '../domain/ping';
import { PingPong } from '../domain/ping';

@Injectable()
export class PingService {
  getPing(): Ping {
    return PingPong.Ping;
  }
}
