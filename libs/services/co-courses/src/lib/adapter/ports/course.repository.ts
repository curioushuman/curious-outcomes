import { TaskEither } from 'fp-ts/lib/TaskEither';

import { ExternalId, Slug } from '@curioushuman/co-common';

import { Course, CourseIdentifier } from '../../domain/entities/course';
import { CourseId } from '../../domain/value-objects/course-id';

/**
 * Literal list of finders for a course
 */
export type CourseFinder = 'findById' | 'findByExternalId' | 'findBySlug';

/**
 * Returns the correct finder for the given identifier
 *
 * Note: obviously this is a hacky way to do this, but it works.
 * If we need to move beyond this un-name restriction of identifier
 * and finder name we can at any point (by using object literal or similar).
 */
export const identifierFinder = (
  identifier: CourseIdentifier
): CourseFinder => {
  let identifierString: string = identifier as string;
  identifierString =
    identifierString.charAt(0).toUpperCase() + identifierString.slice(1);

  return `findBy${identifierString}` as CourseFinder;
};

export abstract class CourseRepository {
  abstract findById(id: CourseId): TaskEither<Error, Course>;
  abstract findByExternalId(externalId: ExternalId): TaskEither<Error, Course>;
  abstract findBySlug(slug: Slug): TaskEither<Error, Course>;

  abstract save(course: Course): TaskEither<Error, void>;
}
