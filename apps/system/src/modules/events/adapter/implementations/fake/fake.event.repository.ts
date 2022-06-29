import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';

import { CoEvent } from '../../../domain/entities/co-event';
import { EventRepository } from '../../ports/event.repository';

@Injectable()
export class FakeEventRepository implements EventRepository {
  private events: CoEvent[] = [];

  send = (event: CoEvent): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        this.events.push(event);
      },
      (error: Error) => error as Error
    );
  };

  all = (): TE.TaskEither<Error, CoEvent[]> => {
    return TE.right(this.events);
  };
}
