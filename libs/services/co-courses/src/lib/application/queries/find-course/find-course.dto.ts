import { Optional, Record, Static } from 'runtypes';

import { ExternalId, Slug } from '@curioushuman/co-common';
import { CourseId } from '../../../domain/value-objects/course-id';

export const FindCourseDto = Record({
  id: Optional(CourseId),
  externalId: Optional(ExternalId),
  slug: Optional(Slug),
});

export type FindCourseDto = Static<typeof FindCourseDto>;
