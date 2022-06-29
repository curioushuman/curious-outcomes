import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { LoggableLogger } from '@curioushuman/loggable';
import { parseActionData } from '@curioushuman/fp-ts-utils';

import { CreateEventRequestDto } from '../../../infra/dto/create-event.request.dto';
import { CoEvent } from '../../../domain/entities/co-event';
import { EventTransformerMapper } from './event-transformer.mapper';
import { EventType } from '../../../domain/value-objects/event-type';
import { EventNotFoundError } from '../../../domain/errors/event-not-found.error';

@Injectable()
export class EventTransformerService {
  constructor(private logger: LoggableLogger) {
    this.logger.setContext(EventTransformerService.name);
  }

  transform = (
    requestDto: CreateEventRequestDto
  ): TE.TaskEither<Error, CoEvent> => {
    return pipe(
      requestDto,

      // #1. check for related event
      this.confirmEventType,

      // #2 transform the dto to a CoEvent
      TE.chain((dto) =>
        pipe(
          dto,
          parseActionData(EventTransformerMapper.fromRequestDto, this.logger)
        )
      )
    );
  };

  /**
   * We use the built-in validation of EventType
   * to confirm what is being asked, is something we support
   */
  confirmEventType = (
    dto: CreateEventRequestDto
  ): TE.TaskEither<Error, CreateEventRequestDto> => {
    return pipe(
      dto.type,
      parseActionData(EventType.check, this.logger),
      TE.mapLeft(() => new EventNotFoundError(dto.type)),
      TE.map(() => dto)
    );
  };
}
