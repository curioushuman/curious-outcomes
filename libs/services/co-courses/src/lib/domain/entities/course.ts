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

export const Course = Record({
  id: CourseId,
  name: CourseName,
  slug: Slug,
  externalId: ExternalId,
});

export type Course = Static<typeof Course>;

/**
 * The list of accepted identifiers for a course
 */
export const CourseIdentifier = Union(
  Literal('id'),
  Literal('externalId'),
  Literal('slug')
);

/**
 * The type definition of accepted course identifiers.
 */
export type CourseIdentifier = Static<typeof CourseIdentifier>; // = 'id' | 'externalId' | 'slug'

/**
 * The course identifiers enum as string[]
 * Used to identify the course identifier in the request
 * and therefore the correct queryDto to use
 */
export const courseIdentifiers: CourseIdentifier[] =
  CourseIdentifier.alternatives.map((lit) => lit.value);

export const courseIdentifierParsers = {
  id: CourseId,
  externalId: ExternalId,
  slug: Slug,
};

export const CourseIdentifierParser = Union(CourseId, ExternalId, Slug);
export type CourseIdentifierParser = Static<typeof CourseIdentifierParser>;
