import { Record, Static } from 'runtypes';

import { ExternalId } from '@curioushuman/co-common';

import { EventId } from '../value-objects/event-id';
import { EventType } from '../value-objects/event-type';

/**
 * Payload format
 * i.e. at this point we only accept ID
 */

export const EventPayload = Record({
  id: ExternalId,
});

export type EventPayload = Static<typeof EventPayload>;

/**
 * The structure of our events
 * Remembering we'll use a generic port, and concrete adapters
 * So this is a generic structure, adapted later to our current
 * messaging system of choice
 *
 * NOTES
 * - eventId is for idempotency
 * - message is to carry the action and the object of the event
 * - payload is to carry the payload of the event
 */
export const CoEvent = Record({
  id: EventId,
  type: EventType,
  payload: EventPayload,
});

export type CoEvent = Static<typeof CoEvent>;
