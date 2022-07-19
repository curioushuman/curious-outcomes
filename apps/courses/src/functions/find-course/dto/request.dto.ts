import { Optional, Record, Static, String } from 'runtypes';

/**
 * This is the form of data we expect as input into our Lambda
 *
 * NOTE: it is remarkably similar to the FindCourseRequestDto within Nest.
 * This is OK, as currently these two things are directly aligned. However,
 * at some point they may diverge; which is also OK. Hence the need for two
 * DTOs, for two different purposes.
 */

export const FindCourseRequestDto = Record({
  id: Optional(String),
  externalId: Optional(String),
  slug: Optional(String),
}).withConstraint((dto) => {
  if ((!dto.id && !dto.externalId && !dto.slug) || isReallyEmptyObj(dto)) {
    return 'Request must include one of: id, externalId, slug';
  }
  return true;
});

export type FindCourseRequestDto = Static<typeof FindCourseRequestDto>;

// TODO: move these to utils
const isReallyEmptyObj = (obj: object) =>
  Object.keys(obj).map((val) => val !== '').length === 0;
