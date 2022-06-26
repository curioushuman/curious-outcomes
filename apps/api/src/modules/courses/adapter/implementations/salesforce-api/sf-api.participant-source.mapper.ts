import { ParticipantSource } from '../../../domain/entities/participant-source';
import { SalesforceApiParticipantSource } from './types/sf-api.participant-source';

export class SalesforceApiParticipantSourceMapper {
  public static toDomain(
    source: SalesforceApiParticipantSource
  ): ParticipantSource {
    return ParticipantSource.check({
      id: source.Id,
      participantId: source.CO_participant_ID__c,
      externalCourseId: source.Case__c,
      firstName: source.Contact_name_first__c,
      lastName: source.Contact_name_last__c,
      email: source.Contact_email__c,
    });
  }
}
