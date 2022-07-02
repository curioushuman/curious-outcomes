import { HttpService } from '@nestjs/axios';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { sequenceT } from 'fp-ts/lib/Apply';

import { SalesforceApiParticipantSource } from '../../types/sf-api.participant-source';
import { CourseSource } from '../../../../../domain/entities/course-source';
import { CourseSourceManufacturer } from './course-source.manufacturer';
import { SalesforceApiSourceManufacturer } from './sf-api.source.manufacturer';
import { SalesforceApiParticipantSourceMapper } from '../../sf-api.participant-source.mapper';
import { ParticipantSource } from '../../../../../domain/entities/participant-source';
import { SalesforceApiRepositoryError } from '../../sf-api.repository.error-factory';
import { SalesforceApiParticipantCreate } from './types/sf-api.participant-create';
import { ExternalId } from '../../../../../domain/value-objects/external-id';
import { PersonManufacturer } from './person.manufacturer';

/**
 * Creates/deletes records in Salesforce around tests
 *
 * TODO
 * - [ ] tidyExtra you could run those two calls in parallel
 */

export class ParticipantSourceManufacturer extends SalesforceApiSourceManufacturer<ParticipantSource> {
  sourceName = 'Participant__c';
  labelFieldName = 'Name';

  /**
   * Note: this is only possible because of runtypes; makes SalesforceApiParticipantSource
   *       available as both a Type and a const.
   */
  fields = Object.keys(SalesforceApiParticipantSource);

  /**
   * Participant is reliant on a Course, so we also need a course manufacturer
   */
  private courseSourceManufacturer: CourseSourceManufacturer;

  /**
   * Participant also reliant on a Person, so we also need a person manufacturer
   */
  private personManufacturer: PersonManufacturer;

  constructor(httpService: HttpService, context: string) {
    super(httpService, context);

    this.courseSourceManufacturer = new CourseSourceManufacturer(
      httpService,
      context
    );

    this.personManufacturer = new PersonManufacturer(httpService, context);
  }

  /**
   * Abstract functions
   */
  tidyExtra = (): TE.TaskEither<SalesforceApiRepositoryError, void> => {
    return TE.tryCatch(
      async () => {
        await this.courseSourceManufacturer.tidyUp();
        await this.personManufacturer.tidyUp();
      },
      (error: Error) => this.handleError(error)
    );
  };

  default = (): TE.TaskEither<
    SalesforceApiRepositoryError,
    SalesforceApiParticipantCreate
  > => {
    return pipe(
      sequenceT(TE.ApplyPar)(this.buildCourseSource(), this.createPerson()),
      TE.map(([courseSource, personId]) =>
        this.populateDefault(courseSource, personId)
      )
    );
  };

  buildCourseSource = (): TE.TaskEither<Error, CourseSource> => {
    return TE.tryCatch(
      async () => {
        return await this.courseSourceManufacturer.build();
      },
      (error: Error) => this.handleError(error)
    );
  };

  createPerson = (): TE.TaskEither<Error, ExternalId> => {
    return TE.tryCatch(
      async () => {
        return await this.personManufacturer.create();
      },
      (error: Error) => this.handleError(error)
    );
  };

  populateDefault = (
    courseSource: CourseSource,
    personId: ExternalId
  ): SalesforceApiParticipantCreate => {
    return {
      Name: this.contextualLabel(),
      Status__c: 'Pending',
      Type__c: 'General participant',
      Case__c: courseSource.id,
      Contact__c: personId,
    };
  };

  mapSource(salesforceType: SalesforceApiParticipantSource): ParticipantSource {
    return SalesforceApiParticipantSourceMapper.toDomain(salesforceType);
  }
}
