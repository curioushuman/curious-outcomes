import { Controller } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { LoggableLogger } from '@curioushuman/loggable';
import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';

import { TransformEventRequestDto } from './dto/transform-event.request.dto';
import { CoEvent } from '../domain/entities/co-event';
import { EventTransformerService } from '../application/services/event-transformer/event-transformer.service';

/**
 * Controller for Events; transforming input/output and routing to commands
 */

@Controller('Events')
export class EventsController {
  constructor(
    private logger: LoggableLogger,
    private readonly eventTransformerService: EventTransformerService
  ) {
    this.logger.setContext('EventsController');
  }

  async transform(requestDto: TransformEventRequestDto): Promise<CoEvent> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(TransformEventRequestDto.check, this.logger),

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
