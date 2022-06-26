import { Record, Static } from 'runtypes';

import { ExternalId } from '../../../domain/value-objects/external-id';

/**
 * This is the form of data our repository will expect for the command
 */

export const CreateParticipantDto = Record({
  externalId: ExternalId,
});

export type CreateParticipantDto = Static<typeof CreateParticipantDto>;
