import { Record, Static } from 'runtypes';

import { ExternalId } from '../../../domain/value-objects/external-id';

export const FindParticipantSourceDto = Record({
  id: ExternalId,
});

export type FindParticipantSourceDto = Static<typeof FindParticipantSourceDto>;
