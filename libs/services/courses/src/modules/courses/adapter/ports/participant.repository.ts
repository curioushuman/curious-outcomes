import { TaskEither } from 'fp-ts/lib/TaskEither';

import { FindParticipantDto } from '../../application/queries/find-participant/find-participant.dto';
import { Participant } from '../../domain/entities/participant';

export abstract class ParticipantRepository {
  abstract findOne(dto: FindParticipantDto): TaskEither<Error, Participant>;
  abstract save(participant: Participant): TaskEither<Error, void>;
}
