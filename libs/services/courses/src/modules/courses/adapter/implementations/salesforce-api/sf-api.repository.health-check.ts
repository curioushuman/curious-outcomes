import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as TE from 'fp-ts/lib/TaskEither';

import { LoggableLogger } from '@curioushuman/loggable';

import { RepositoryHealthCheck } from '../../ports/repository.health-check';

@Injectable()
export class SalesforceApiRepositoryHealthCheck
  implements RepositoryHealthCheck
{
  private sourceName: string;

  constructor(
    private httpService: HttpService,
    private logger: LoggableLogger
  ) {
    this.sourceName = 'Participant__c';
    this.logger.setContext(SalesforceApiRepositoryHealthCheck.name);
  }

  /**
   * TODO
   * - [ ] find a useful+public SF endpoint for this
   */
  livenessProbe = (): TE.TaskEither<Error, boolean> => {
    return TE.tryCatch(
      async () => {
        const request$ = this.httpService.get(
          `https://pokeapi.co/api/v2/language/en`
        );
        await firstValueFrom(request$);
        // if a value is received, without an error we're good
        return true;
      },
      (error: Error) => error as Error
    );
  };
}
