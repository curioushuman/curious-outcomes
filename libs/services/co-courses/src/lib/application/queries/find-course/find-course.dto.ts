import { Record, Static } from 'runtypes';

import { CourseId } from '../../../domain/value-objects/course-id';

export const FindCourseDto = Record({
  id: CourseId,
});

export type FindCourseDto = Static<typeof FindCourseDto>;
