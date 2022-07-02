import { Static } from 'runtypes';

import { InternalId, createInternalId } from '@curioushuman/co-common';

export const CourseId = InternalId.withBrand('CourseId');

export type CourseId = Static<typeof CourseId>;

export const createCourseId = (): CourseId => {
  return CourseId.check(createInternalId());
};
