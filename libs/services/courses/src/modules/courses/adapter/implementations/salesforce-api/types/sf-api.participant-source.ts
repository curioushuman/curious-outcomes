import { Array, Null, Optional, Record, Static, String } from 'runtypes';

import { ExternalId } from '../../../../domain/value-objects/external-id';
import { SalesforceApiResponseRecord } from './sf-api.response';
import { InternalId } from '../../../../../../shared/domain/value-objects/internalId';

/**
 * TODO
 * - [ ] description
 */

/**
 * This represents data we expect from Salesforce
 * - some fields may be empty
 * - Salesforce generally loves to return them as Null
 *
 * NOTE: the Contact_NNN fields happen to exist in APF implementation
 *       we could, in future, obtain them directly from Contact if necessary
 *       using query endpoint, rather than sobjects/contact
 */
export const SalesforceApiParticipantSource =
  SalesforceApiResponseRecord.extend({
    Id: ExternalId,
    CO_participant_ID__c: Optional(InternalId.Or(Null)),
    Case__c: ExternalId,
    Contact_name_first__c: Optional(String.Or(Null)),
    Contact_name_last__c: String,
    Contact_email__c: String,
  });

export type SalesforceApiParticipantSource = Static<
  typeof SalesforceApiParticipantSource
>;

export const SalesforceApiParticipantSources = Record({
  records: Array(SalesforceApiParticipantSource),
});

export type SalesforceApiParticipantSources = Static<
  typeof SalesforceApiParticipantSources
>;
