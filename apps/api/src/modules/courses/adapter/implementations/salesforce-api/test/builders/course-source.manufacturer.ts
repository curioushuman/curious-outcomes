import { HttpService } from '@nestjs/axios';
import * as TE from 'fp-ts/lib/TaskEither';

import { CourseSource } from '../../../../../domain/entities/course-source';
import { SalesforceApiCourseSourceMapper } from '../../sf-api.course-source.mapper';
import { SalesforceApiCourseSource } from '../../types/sf-api.course-source';
import { SalesforceApiRepositoryError } from '../../sf-api.repository.error-factory';
import { SalesforceApiSourceManufacturer } from './sf-api.source.manufacturer';
import { SalesforceApiCourseCreate } from './types/sf-api.course-create';

/**
 * Creates/deletes records in Salesforce around tests
 */

export class CourseSourceManufacturer extends SalesforceApiSourceManufacturer<CourseSource> {
  sourceName = 'Case';
  labelFieldName = 'Subject';

  /**
   * Note: this is only possible because of runtypes; makes SalesforceApiCourseSource
   *       available as both a Type and a const.
   */
  fields = Object.keys(SalesforceApiCourseSource);

  constructor(httpService: HttpService, context: string) {
    super(httpService, context);
  }

  /**
   * Abstract functions
   */
  tidyExtra = (): TE.TaskEither<SalesforceApiRepositoryError, void> => {
    let noop: undefined;
    return TE.right(noop);
  };

  default = (): TE.TaskEither<
    SalesforceApiRepositoryError,
    SalesforceApiCourseCreate
  > => {
    return TE.right(this.populateDefault());
  };

  populateDefault = (): SalesforceApiCourseCreate => {
    return {
      Subject: this.contextualLabel(),
      Status: 'In progress',
      Type: 'Capacity development',
      Type_sub__c: 'Blended learning',
      Case_Year__c: '2022',
      RecordTypeId: '0120K000000yprEQAQ',
    };
  };

  mapSource(salesforceType: SalesforceApiCourseSource): CourseSource {
    return SalesforceApiCourseSourceMapper.toDomain(salesforceType);
  }
}
