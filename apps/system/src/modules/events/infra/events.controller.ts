import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { LoggableLogger } from '@curioushuman/loggable';
import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';

import { CreateEventRequestDto } from './dto/create-event.request.dto';
import { CreateEventMapper } from '../application/commands/create-event/create-event.mapper';
import { CreateEventCommand } from '../application/commands/create-event/create-event.command';
import { CoEvent } from '../domain/entities/co-event';
import { EventTransformerService } from '../application/services/event-transformer/event-transformer.service';

/**
 * Controller for Events; transforming input/output and routing to commands
 */

@Controller('Events')
export class EventsController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus,
    private readonly eventTransformerService: EventTransformerService
  ) {
    this.logger.setContext('EventsController');
  }

  async create(requestDto: CreateEventRequestDto): Promise<void> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(CreateEventRequestDto.check, this.logger),
      TE.chain((dto) =>
        parseActionData(CreateEventMapper.fromRequestDto, this.logger)(dto)
      ),

      // #2. call the command (to create the Event)
      // NOTE: errors already converted by the command
      TE.chain((createEventDto) =>
        TE.tryCatch(
          async () => {
            const command = new CreateEventCommand(createEventDto);
            return await this.commandBus.execute<CreateEventCommand>(command);
          },
          (error: Error) => error as Error
        )
      )
    );

    return executeTask(task);
  }

  async transform(
    createEventRequestDto: CreateEventRequestDto
  ): Promise<CoEvent> {
    const task = pipe(
      createEventRequestDto,

      // #1. parse the dto
      parseActionData(CreateEventRequestDto.check, this.logger),

      // #2. transform to Event
      TE.chain((dto) =>
        parseActionData(
          this.eventTransformerService.transform,
          this.logger
        )(dto)
      ),
      TE.flatten
    );

    return executeTask(task);
  }
}
