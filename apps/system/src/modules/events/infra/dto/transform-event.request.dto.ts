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

export const TransformEventRequestMinimumData = Record({
  id: ExternalId,
});

export type TransformEventRequestMinimumData = Static<
  typeof TransformEventRequestMinimumData
>;

/**
 * Actual data requirements for creating an event.
 * i.e. id, plus a bunch of other fields
 */

export const TransformEventRequestData = TransformEventRequestMinimumData.And(
  Dictionary(String, Union(String, Number).optional())
);

export type TransformEventRequestData = Static<
  typeof TransformEventRequestData
>;

/**
 * Form of data we expect from external systems
 *
 * NOTES
 * - eventId is for idempotency
 * - type is to carry the action and the object of the event
 * - data is to carry the payload of the event
 */
export const TransformEventRequestDto = Record({
  eventId: Optional(EventId),
  type: String,
  data: TransformEventRequestData,
});

export type TransformEventRequestDto = Static<typeof TransformEventRequestDto>;
