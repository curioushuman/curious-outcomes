import {
  Dictionary,
  Number,
  Optional,
  Record,
  Static,
  String,
  Union,
} from 'runtypes';

import { ExternalId } from '@curioushuman/co-common';

import { EventId } from '../../domain/value-objects/event-id';

/**
 * Minimum data requirements for creating an event.
 * i.e. must include id
 */

export const CreateEventRequestMinimumData = Record({
  id: ExternalId,
});

export type CreateEventRequestMinimumData = Static<
  typeof CreateEventRequestMinimumData
>;

/**
 * Actual data requirements for creating an event.
 * i.e. id, plus a bunch of other fields
 */

export const CreateEventRequestData = CreateEventRequestMinimumData.And(
  Dictionary(String, Union(String, Number).optional())
);

export type CreateEventRequestData = Static<typeof CreateEventRequestData>;

/**
 * Form of data we expect from external systems
 *
 * NOTES
 * - eventId is for idempotency
 * - type is to carry the action and the object of the event
 * - data is to carry the payload of the event
 */
export const CreateEventRequestDto = Record({
  eventId: Optional(EventId),
  type: String,
  data: CreateEventRequestData,
});

export type CreateEventRequestDto = Static<typeof CreateEventRequestDto>;
