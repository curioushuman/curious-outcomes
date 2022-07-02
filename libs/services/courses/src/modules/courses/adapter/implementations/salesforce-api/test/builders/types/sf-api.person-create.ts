import { Literal, Record, Static, String, Union } from 'runtypes';

const EmailPreference = Union(
  Literal('Personal'),
  Literal('Work'),
  Literal('Alternate')
);

/**
 * Min. fields required to create a Person in Salesforce
 */
export const SalesforceApiPersonCreate = Record({
  FirstName: String,
  LastName: String,
  npe01__WorkEmail__c: String,
  npe01__Preferred_Email__c: EmailPreference,
});

export type SalesforceApiPersonCreate = Static<
  typeof SalesforceApiPersonCreate
>;
