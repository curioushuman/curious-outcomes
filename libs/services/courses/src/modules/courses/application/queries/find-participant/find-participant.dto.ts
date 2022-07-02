import { Record, Static } from 'runtypes';

import { ExternalId } from '../../../domain/value-objects/external-id';

export const FindParticipantDto = Record({
  externalId: ExternalId,
});

export type FindParticipantDto = Static<typeof FindParticipantDto>;
