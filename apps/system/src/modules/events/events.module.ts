import { Module } from '@nestjs/common';

import { LoggableModule } from '@curioushuman/loggable';

import { EventsController } from './infra/events.controller';
import { EventTransformerService } from './application/services/event-transformer/event-transformer.service';

const services = [EventTransformerService];

/**
 * Events module
 *
 * NOTES
 * - Event is the aggregate root of this module
 *  - therefore all *commands* should be routed through it
 */

@Module({
  imports: [LoggableModule],
  controllers: [EventsController],
  providers: [...services],
  exports: [],
})
export class EventsModule {}
