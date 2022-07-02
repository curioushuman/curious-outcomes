import { Static } from 'runtypes';

import {
  InternalId,
  createInternalId,
} from '../../../../shared/domain/value-objects/internalId';

export const ParticipantId = InternalId.withBrand('ParticipantId');

export type ParticipantId = Static<typeof ParticipantId>;

export const createParticipantId = (): ParticipantId => {
  return ParticipantId.check(createInternalId());
};
