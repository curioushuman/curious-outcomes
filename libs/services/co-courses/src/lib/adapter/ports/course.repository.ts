import { TaskEither } from 'fp-ts/lib/TaskEither';

import { FindCourseDto } from '../../application/queries/find-course/find-course.dto';
import { Course } from '../../domain/entities/course';

export abstract class CourseRepository {
  abstract findOne(dto: FindCourseDto): TaskEither<Error, Course>;
  abstract save(course: Course): TaskEither<Error, void>;
}
