import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { LoggableModule } from '@curioushuman/loggable';
// import { ErrorFactory } from '@curioushuman/error-factory';

import { EventsController } from './infra/events.controller';
import { CreateEventHandler } from './application/commands/create-event/create-event.command';

const commandHandlers = [CreateEventHandler];

// const services = [
//   {
//     provide: ErrorFactory,
//     useClass: SalesforceApiRepositoryErrorFactory,
//   },
// ];

/**
 * Events module
 *
 * NOTES
 * - Event is the aggregate root of this module
 *  - therefore all *commands* should be routed through it
 */

@Module({
  imports: [CqrsModule, LoggableModule],
  controllers: [EventsController],
  providers: [...commandHandlers],
  exports: [],
})
export class EventsModule {}
