import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { ErrorFactory } from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';
import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';

import { EventRepository } from '../../../adapter/ports/event.repository';
import { CreateEventDto } from './create-event.dto';
import { CreateEventMapper } from './create-event.mapper';

export class CreateEventCommand implements ICommand {
  constructor(public readonly createEventDto: CreateEventDto) {}
}

/**
 * Command handler for create Event
 */
@CommandHandler(CreateEventCommand)
export class CreateEventHandler implements ICommandHandler<CreateEventCommand> {
  constructor(
    private readonly EventRepository: EventRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(CreateEventHandler.name);
  }

  async execute(command: CreateEventCommand): Promise<void> {
    const { createEventDto } = command;

    const task = pipe(
      // #1. parse the dto
      createEventDto,
      parseActionData(
        CreateEventMapper.toEvent,
        this.logger,
        'RequestInvalidError'
      ),

      // #2. create the Event
      TE.chain((Event) =>
        performAction(
          Event,
          this.EventRepository.send,
          this.errorFactory,
          this.logger,
          `Emit Event`
        )
      )
    );

    return executeTask(task);
  }
}
