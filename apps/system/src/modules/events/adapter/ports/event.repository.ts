import { TaskEither } from 'fp-ts/lib/TaskEither';

import { CoEvent } from '../../domain/entities/co-event';

export abstract class EventRepository {
  abstract send(event: CoEvent): TaskEither<Error, void>;
}
