import { InternalId } from '../../../../../../shared/domain/value-objects/internalId';
import { Array, Null, Optional, Record, Static, String } from 'runtypes';
import { ExternalId } from '../../../../domain/value-objects/external-id';
import { SalesforceApiResponseRecord } from './sf-api.response';

/**
 * TODO
 * - [ ] description
 */

/**
 * This represents data we expect from Salesforce
 * - some fields may be empty
 * - Salesforce generally loves to return them as Null
 */
export const SalesforceApiCourseSource = SalesforceApiResponseRecord.extend({
  Id: ExternalId,
  Summary_quick_year__c: String,
  Slug__c: String,
  CO_course_ID__c: Optional(InternalId.Or(Null)),
  Date_start__c: Optional(String.Or(Null)),
  Date_end__c: Optional(String.Or(Null)),
});

export type SalesforceApiCourseSource = Static<
  typeof SalesforceApiCourseSource
>;

export const SalesforceApiCourseSources = Record({
  records: Array(SalesforceApiCourseSource),
});

export type SalesforceApiCourseSources = Static<
  typeof SalesforceApiCourseSources
>;
