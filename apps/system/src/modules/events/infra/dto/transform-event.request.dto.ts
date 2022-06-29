import { Static } from 'runtypes';

import { CreateEventRequestDto } from './create-event.request.dto';

/**
 * Form of data we expect from external systems
 *
 * NOTES
 * - eventId is for idempotency
 * - type is to carry the action and the object of the event
 * - data is to carry the payload of the event
 */
export const TransformEventRequestDto =
  CreateEventRequestDto.withBrand('CourseId');

export type TransformEventRequestDto = Static<typeof TransformEventRequestDto>;
