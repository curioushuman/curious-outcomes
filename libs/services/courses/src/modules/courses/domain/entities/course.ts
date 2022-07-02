import { Record, Static } from 'runtypes';

import { ExternalId, Slug } from '@curioushuman/co-common';

import { CourseName } from '../value-objects/course-name';
import { CourseId } from '../value-objects/course-id';

/**
 * TODO
 * - [ ] startDate
 * - [ ] endDate
 * - [ ] description
 */

export const Course = Record({
  id: CourseId,
  name: CourseName,
  slug: Slug,
  externalId: ExternalId,
});

export type Course = Static<typeof Course>;
