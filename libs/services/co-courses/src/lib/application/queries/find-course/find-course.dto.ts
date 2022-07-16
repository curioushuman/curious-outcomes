import { Record, Runtype, Static, String, Union } from 'runtypes';

import { ExternalId, Slug } from '@curioushuman/co-common';

import { CourseId } from '../../../domain/value-objects/course-id';
import {
  CourseIdentifier,
  CourseIdentifierParser,
} from '../../../domain/entities/course';

export type FindCourseDtoTypesDef = {
  id: CourseId;
  // externalId: ExternalId;
  // slug: Slug;
};
export type FindCourseDtoIdentifier = keyof FindCourseDtoTypesDef;

type FindCourseDtoTypes = {
  [I in FindCourseDtoIdentifier]: {
    identifier: I;
    value: FindCourseDtoTypesDef[I];
  };
};

type FindCourseDtoParser<I extends FindCourseDtoIdentifier> = (
  dto: FindCourseDtoTypes[I]
) => FindCourseDtoTypesDef[I];
type FindCourseDtoParsers = {
  [K in FindCourseDtoIdentifier]: FindCourseDtoParser<K>;
};

const parsers: FindCourseDtoParsers = {
  id: (dto) => CourseId.check(dto.value),
  // externalId: dto => console.log(dto),
  // slug: dto => console.log(dto),
};

export type FindCourseDto = FindCourseDtoTypes[keyof FindCourseDtoTypes];
export const parseDto = <I extends FindCourseDtoIdentifier>(
  dto: FindCourseDtoTypes[I]
) => (parsers[dto.identifier] as FindCourseDtoParser<I>)(dto);
