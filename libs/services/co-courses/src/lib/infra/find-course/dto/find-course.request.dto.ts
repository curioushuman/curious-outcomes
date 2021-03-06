import { Optional, Record, Static, String } from 'runtypes';

/**
 * This is the form of data we expect as input into our application
 *
 * NOTE: this has been updated to accept strings. As this is the external
 * facing DTO, this will be OK. We then need to validate as we proceed
 * further into application layers.
 */

export const FindCourseRequestDto = Record({
  id: Optional(String),
  externalId: Optional(String),
  slug: Optional(String),
}).withConstraint((dto) => {
  if (!dto.id && !dto.externalId && !dto.slug) {
    return 'Request must include one of: id, externalId, slug';
  }
  return true;
});

export type FindCourseRequestDto = Static<typeof FindCourseRequestDto>;
