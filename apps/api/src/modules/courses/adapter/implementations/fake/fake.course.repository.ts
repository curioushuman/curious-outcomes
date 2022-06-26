import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { Course } from '../../../domain/entities/course';
import { CourseRepository } from '../../ports/course.repository';
import { CourseBuilder } from '../../../test/builders/course.builder';
import { FindCourseDto } from '../../../application/queries/find-course/find-course.dto';

@Injectable()
export class FakeCourseRepository implements CourseRepository {
  private courses: Course[] = [];

  constructor() {
    this.courses.push(CourseBuilder().exists().build());
  }

  findOne = (dto: FindCourseDto): TE.TaskEither<Error, Course> => {
    const { externalId } = dto;
    return TE.tryCatch(
      async () => {
        const course = this.courses.find((cs) => cs.externalId === externalId);
        return pipe(
          course,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(
                `Course with externalId ${externalId} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (course) => Course.check(course)
          )
        );
      },
      (error: Error) => error as Error
    );
  };

  save = (course: Course): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        this.courses.push(course);
      },
      (error: Error) => error as Error
    );
  };

  all = (): TE.TaskEither<Error, Course[]> => {
    return TE.right(this.courses);
  };
}
