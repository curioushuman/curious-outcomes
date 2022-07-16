import { CourseId } from '../../../domain/value-objects/course-id';
import {
  CourseIdentifier,
  CourseIdentifiers,
} from '../../../domain/entities/course';

/**
 * This type sets up our identifiers as discriminated unions.
 */
type FindCourseDtoTypes = {
  [I in CourseIdentifier]: {
    identifier: I;
    value: CourseIdentifiers[I];
  };
};

/**
 * A type for the DTO parser function
 */
type FindCourseDtoParser<I extends CourseIdentifier> = (
  dto: FindCourseDtoTypes[I]
) => CourseIdentifiers[I];

/**
 * A type to represent an object that houses all
 * our available parsers for the DTO.
 */
type FindCourseDtoParsers = {
  [K in CourseIdentifier]: FindCourseDtoParser<K>;
};

/**
 * The concrete object that houses all our actual parsers
 */
const parsers: FindCourseDtoParsers = {
  id: (dto) => CourseId.check(dto.value),
  // externalId: dto => console.log(dto),
  // slug: dto => console.log(dto),
};

/**
 * A type for our DTO, which is basically a union of the various
 * discriminated unions (DU) created at the top. These DUs are based on
 * the identifiers defined for our Course entity.
 */
export type FindCourseDto = FindCourseDtoTypes[keyof FindCourseDtoTypes];

/**
 * This function parses the DTO based on the discriminated unions
 */
export const parseDto = <I extends CourseIdentifier>(
  dto: FindCourseDtoTypes[I]
) => (parsers[dto.identifier] as FindCourseDtoParser<I>)(dto);
