import { HttpService } from '@nestjs/axios';
import * as TE from 'fp-ts/lib/TaskEither';

import { SalesforceApiRepositoryError } from '../../sf-api.repository.error-factory';
import { SalesforceApiManufacturer } from './sf-api.manufacturer';
import { SalesforceApiPersonCreate } from './types/sf-api.person-create';

/**
 * Creates/deletes records in Salesforce around tests
 */

export class PersonManufacturer extends SalesforceApiManufacturer<SalesforceApiPersonCreate> {
  sourceName = 'Contact';
  labelFieldName = 'LastName';

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
    SalesforceApiPersonCreate
  > => {
    return TE.right(this.populateDefault());
  };

  populateDefault = (): SalesforceApiPersonCreate => {
    return {
      FirstName: 'Testina',
      LastName: this.contextualLabel(),
      npe01__WorkEmail__c: 'test@ina.com',
      npe01__Preferred_Email__c: 'Work',
    };
  };
}
