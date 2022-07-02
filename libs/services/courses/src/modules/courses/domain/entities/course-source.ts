import { Null, Optional, Record, Static } from 'runtypes';

import { ExternalId } from '../value-objects/external-id';
import { CourseName } from '../value-objects/course-name';
import { Slug } from '../../../../shared/domain/value-objects/slug';
import { CourseId } from '../value-objects/course-id';

/**
 * TODO
 * - [ ] startDate
 * - [ ] endDate
 * - [ ] description
 */

export const CourseSource = Record({
  id: ExternalId,
  name: CourseName,
  slug: Optional(Slug),
  courseId: Optional(CourseId.Or(Null)),
});

export type CourseSource = Static<typeof CourseSource>;

// courseId must in fact be empty when we are creating a course (from source)
const sourceForCreate = Record({
  courseId: Optional(CourseId.Or(Null)).withConstraint(
    (courseId) =>
      !courseId || `Source (${courseId}) already associated with a Course`
  ),
});
export const CourseSourceForCreate = sourceForCreate.And(CourseSource);

export type CourseSourceForCreate = Static<typeof CourseSourceForCreate>;
