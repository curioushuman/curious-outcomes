import { Record, Static } from 'runtypes';

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

export const Course = Record({
  id: CourseId,
  name: CourseName,
  slug: Slug,
  externalId: ExternalId,
});

export type Course = Static<typeof Course>;
