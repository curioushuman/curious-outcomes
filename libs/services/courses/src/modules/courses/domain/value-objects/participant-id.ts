import { Static } from 'runtypes';

import { InternalId, createInternalId } from '@curioushuman/co-common';

export const ParticipantId = InternalId.withBrand('ParticipantId');

export type ParticipantId = Static<typeof ParticipantId>;

export const createParticipantId = (): ParticipantId => {
  return ParticipantId.check(createInternalId());
};
