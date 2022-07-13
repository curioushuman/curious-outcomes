import { Optional, Record, Static } from 'runtypes';

import { ExternalId, Slug } from '@curioushuman/co-common';
import { CourseId } from '../../../domain/value-objects/course-id';

/**
 * This is the form of data we expect as input into our API/Request
 */

export const FindCourseRequestDto = Record({
  id: Optional(CourseId),
  externalId: Optional(ExternalId),
  slug: Optional(Slug),
});

export type FindCourseRequestDto = Static<typeof FindCourseRequestDto>;
