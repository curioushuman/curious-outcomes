import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { sequenceT } from 'fp-ts/lib/Apply';

import { LoggableLogger } from '@curioushuman/loggable';

import { ParticipantRepository } from '../../../adapter/ports/participant.repository';
import { executeTask } from '../../../../../shared/utils/execute-task';
import { CreateParticipantDto } from './create-participant.dto';
import { CreateParticipantMapper } from './create-participant.mapper';
import { ParticipantSourceRepository } from '../../../adapter/ports/participant-source.repository';
import { ParticipantSourceForCreate } from '../../../domain/entities/participant-source';
import { RepositoryItemConflictError } from '../../../../../shared/domain/errors/repository/item-conflict.error';
import { performAction } from '../../../../../shared/utils/perform-action';
import { parseActionData } from '../../../../../shared/utils/parse-action-data';
import { ErrorFactory } from '../../../../../shared/domain/errors/error-factory';
import { ParticipantSourceHydrationService } from '../../services/participant-source-hydration.service';

export class CreateParticipantCommand implements ICommand {
  constructor(public readonly createParticipantDto: CreateParticipantDto) {}
}

/**
 * Command handler for create participant
 * TODO
 * - [ ] better associated participant check
 *       e.g. check against local IDs rather than just existence of participantId
 */
@CommandHandler(CreateParticipantCommand)
export class CreateParticipantHandler
  implements ICommandHandler<CreateParticipantCommand>
{
  constructor(
    private readonly participantRepository: ParticipantRepository,
    private readonly participantSourceRepository: ParticipantSourceRepository,
    private readonly participantSourceHydrationService: ParticipantSourceHydrationService,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(CreateParticipantHandler.name);
  }

  async execute(command: CreateParticipantCommand): Promise<void> {
    const { createParticipantDto } = command;

    const task = pipe(
      // #1. parse the dto
      createParticipantDto,
      parseActionData(
        CreateParticipantMapper.toFindParticipantSourceDto,
        this.logger,
        'RequestInvalidError'
      ),

      // #2. find the source
      // Returns a valid participant source
      TE.chain((findSourceDto) =>
        performAction(
          findSourceDto,
          this.participantSourceRepository.findOne,
          this.errorFactory,
          this.logger,
          'find participant source'
        )
      ),

      // #3. hydrate the source
      TE.chain((participantSource) =>
        performAction(
          participantSource,
          this.participantSourceHydrationService.hydrate,
          this.errorFactory,
          this.logger,
          'find participant source'
        )
      ),

      // #4. parse the source
      TE.chain((participantSourceHydrated) =>
        sequenceT(TE.ApplySeq)(
          // this is a secondary source validation check
          // for `create` specific aspects
          parseActionData(
            ParticipantSourceForCreate.check,
            this.logger,
            'SourceInvalidError'
          )(participantSourceHydrated),
          parseActionData(
            CreateParticipantMapper.fromSourceToFindParticipantDto,
            this.logger,
            'SourceInvalidError'
          )(participantSourceHydrated),
          parseActionData(
            CreateParticipantMapper.fromSourceToParticipant,
            this.logger,
            'SourceInvalidError'
          )(participantSourceHydrated)
        )
      ),

      // #5. check for conflict
      TE.chain(([source, findParticipantDto, participantFromSource]) =>
        pipe(
          performAction(
            findParticipantDto,
            this.participantRepository.findOne,
            this.errorFactory,
            this.logger,
            `check participant exists for source: ${source.id}`
          ),
          TE.chain((existingParticipant) => {
            throw new RepositoryItemConflictError(existingParticipant.email);
          }),
          TE.alt(() => TE.right(participantFromSource))
        )
      ),

      // #6. create the participant, from the source
      TE.chain((participant) =>
        performAction(
          participant,
          this.participantRepository.save,
          this.errorFactory,
          this.logger,
          `save participant from source`
        )
      )
    );

    return executeTask(task);
  }
}
