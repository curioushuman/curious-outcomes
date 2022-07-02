import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';

import { ParticipantSource } from '../../../domain/entities/participant-source';
import { ParticipantSourceRepository } from '../../ports/participant-source.repository';
import { FindParticipantSourceDto } from '../../../application/queries/find-participant-source/find-participant-source.dto';
import { RequestInvalidError } from '../../../../../shared/domain/errors/request-invalid.error';
import { SalesforceApiParticipantSourceMapper } from './sf-api.participant-source.mapper';
import { SalesforceApiParticipantSource } from './types/sf-api.participant-source';

@Injectable()
export class SalesforceApiParticipantSourceRepository
  implements ParticipantSourceRepository
{
  private sourceName: string;

  constructor(
    private httpService: HttpService,
    private logger: LoggableLogger
  ) {
    this.sourceName = 'Participant__c';
    this.logger.setContext(SalesforceApiParticipantSourceRepository.name);
  }

  findOne = (
    dto: FindParticipantSourceDto
  ): TE.TaskEither<Error, ParticipantSource> => {
    const { id } = dto;
    if (!id) {
      throw new RequestInvalidError(
        'Invalid ID supplied to findOne() in SalesforceApi'
      );
    }
    const endpoint = `sobjects/${this.sourceName}/${id}`;
    // TODO: use keyof to get the fields
    const fields = Object.keys(SalesforceApiParticipantSource);
    this.logger.debug(`Finding ${this.sourceName} with endpoint ${endpoint}`);
    return TE.tryCatch(
      async () => {
        const request$ = this.httpService.get<SalesforceApiParticipantSource>(
          endpoint,
          {
            params: {
              fields,
            },
          }
        );
        const response = await firstValueFrom(request$);

        // NOTE: if the response was invalid, an error would have been thrown
        // could this similarly be in a serialisation decorator?
        return SalesforceApiParticipantSourceMapper.toDomain(response.data);
      },
      (error: Error) => error as Error
    );
  };
}
