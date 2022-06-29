import { Dictionary, Number, Record, Static, String, Union } from 'runtypes';

import { ExternalId } from '@curioushuman/co-common';

import { EventId } from '../../../domain/value-objects/event-id';
import { EventType } from '../../../domain/value-objects/event-type';

/**
 * Minimum data requirements for creating an event.
 * i.e. must include id
 */

export const EventRequestMinimumData = Record({
  id: ExternalId,
});

export type EventRequestMinimumData = Static<typeof EventRequestMinimumData>;

/**
 * Actual data requirements for creating an event.
 * i.e. id, plus a bunch of other fields
 */

export const EventRequestData = EventRequestMinimumData.And(
  Dictionary(String, Union(String, Number))
);

/**
 * The structure we'll pass to the create event command
 *
 * NOTE: we'll pass the data through for now
 *       as essentially it shouldn't really be included yet
 */
export const CreateEventDto = Record({
  eventId: EventId,
  type: EventType,
  data: EventRequestData,
});

export type CreateEventDto = Static<typeof CreateEventDto>;
