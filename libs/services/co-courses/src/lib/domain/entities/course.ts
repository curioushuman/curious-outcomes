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

/**
 * Runtypes constant for the (internal) Course entity
 * Used for type checking and validation
 */
export const Course = Record({
  id: CourseId,
  name: CourseName,
  slug: Slug,
  externalId: ExternalId,
});

/**
 * Type for the (internal) course entity
 */
export type Course = Static<typeof Course>;

/**
 * Type that defines all the possible identifiers for a course
 * NOTE: this is utilized in find-course.dto.ts and course.repository.ts
 * to define parsers and finders.
 */
export type CourseIdentifiers = {
  id: CourseId;
  externalId: ExternalId;
  slug: Slug;
};
export type CourseIdentifier = keyof CourseIdentifiers;
