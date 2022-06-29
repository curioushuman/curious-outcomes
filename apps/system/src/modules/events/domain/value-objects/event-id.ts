import { Static, String } from 'runtypes';

import { createInternalId } from '@curioushuman/co-common';

/**
 * (Currently loose) format for event ID
 *
 * TODO
 * - [ ] tighten this up
 * - [ ] implement a better createId function
 *       essentially this is about idempotency
 *       and currently this is a bit of a shit method
 */

export const EventId = String.withBrand('EventId').withConstraint(
  (eventId) => !!eventId || `Event Id cannot be empty`
);

export type EventId = Static<typeof EventId>;

export const createEventId = (): EventId => {
  return EventId.check(createInternalId());
};
