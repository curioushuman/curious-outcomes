import { Literal, Record, Static, Union } from 'runtypes';

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
 *
 */
export type CourseIdentifiers = {
  id: CourseId;
  // externalId: ExternalId;
  // slug: Slug;
};
export type CourseIdentifier = keyof CourseIdentifiers;
