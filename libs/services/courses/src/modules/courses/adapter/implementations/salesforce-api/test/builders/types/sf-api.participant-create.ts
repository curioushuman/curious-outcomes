import { Literal, Record, Static, String, Union } from 'runtypes';

const ParticipantSourceType = Union(
  Literal('Chairperson / leader (of this activity)'),
  Literal('External stakeholder'),
  Literal('Facilitator'),
  Literal('General participant'),
  Literal('Mentee'),
  Literal('Mentor'),
  Literal('Observer'),
  Literal('Other'),
  Literal('Subject matter expert / speaker'),
  Literal('Support person / team member')
);

const ParticipantSourceStatus = Union(
  Literal('Pending'),
  Literal('Registered'),
  Literal('Cancelled'),
  Literal('Attended, full participation'),
  Literal('Attended, partial participation')
);

/**
 * Min. fields required to create a Participant in Salesforce
 */
export const SalesforceApiParticipantCreate = Record({
  Name: String,
  Status__c: ParticipantSourceStatus,
  Type__c: ParticipantSourceType,
  Case__c: String,
  Contact__c: String,
});

export type SalesforceApiParticipantCreate = Static<
  typeof SalesforceApiParticipantCreate
>;
