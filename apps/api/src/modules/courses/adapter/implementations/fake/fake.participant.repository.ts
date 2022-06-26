import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { Participant } from '../../../domain/entities/participant';
import { ParticipantRepository } from '../../ports/participant.repository';
import { ParticipantBuilder } from '../../../test/builders/participant.builder';
import { FindParticipantDto } from '../../../application/queries/find-participant/find-participant.dto';

@Injectable()
export class FakeParticipantRepository implements ParticipantRepository {
  private participants: Participant[] = [];

  constructor() {
    this.participants.push(ParticipantBuilder().exists().build());
  }

  findOne = (dto: FindParticipantDto): TE.TaskEither<Error, Participant> => {
    const { externalId } = dto;
    return TE.tryCatch(
      async () => {
        const participant = this.participants.find(
          (cs) => cs.externalId === externalId
        );
        return pipe(
          participant,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `Participant with externalId ${externalId} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (participant) => Participant.check(participant)
          )
        );
      },
      (error: Error) => error as Error
    );
  };

  save = (participant: Participant): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        this.participants.push(participant);
      },
      (error: Error) => error as Error
    );
  };

  all = (): TE.TaskEither<Error, Participant[]> => {
    return TE.right(this.participants);
  };
}
