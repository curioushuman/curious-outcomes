import { Optional, Record, Static, String } from 'runtypes';

/**
 * Min. fields required to create a Course in Salesforce
 */
export const SalesforceApiCourseCreate = Record({
  Subject: String,
  Status: String,
  Type: String,
  Type_sub__c: String,
  Case_Year__c: String,
  RecordTypeId: String,
  CO_course_ID__c: Optional(String),
});

export type SalesforceApiCourseCreate = Static<
  typeof SalesforceApiCourseCreate
>;
