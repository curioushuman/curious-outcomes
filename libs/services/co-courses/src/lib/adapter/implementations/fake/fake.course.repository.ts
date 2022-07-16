import { Injectable, NotFoundException } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import * as O from 'fp-ts/lib/Option';
import { pipe } from 'fp-ts/lib/function';

import { ExternalId, Slug } from '@curioushuman/co-common';

import { Course } from '../../../domain/entities/course';
import { CourseRepository } from '../../ports/course.repository';
import { CourseBuilder } from '../../../test/builders/course.builder';
import { CourseId } from '../../../domain/value-objects/course-id';

@Injectable()
export class FakeCourseRepository implements CourseRepository {
  private courses: Course[] = [];

  constructor() {
    this.courses.push(CourseBuilder().exists().build());
  }

  findById = (id: CourseId): TE.TaskEither<Error, Course> => {
    return TE.tryCatch(
      async () => {
        const course = this.courses.find((cs) => cs.id === id);
        return pipe(
          course,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(`Course with id ${id} not found`);
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (course) => Course.check(course)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  findByExternalId = (externalId: ExternalId): TE.TaskEither<Error, Course> => {
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
                `Course with id ${externalId} not found`
              );
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (course) => Course.check(course)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  findBySlug = (slug: Slug): TE.TaskEither<Error, Course> => {
    return TE.tryCatch(
      async () => {
        const course = this.courses.find((cs) => cs.slug === slug);
        return pipe(
          course,
          O.fromNullable,
          O.fold(
            () => {
              // this mimics an API or DB call throwing an error
              throw new NotFoundException(`Course with slug ${slug} not found`);
            },
            // this mimics the fact that all non-fake adapters
            // will come with a mapper, which will perform a check
            // prior to return
            (course) => Course.check(course)
          )
        );
      },
      (reason: unknown) => reason as Error
    );
  };

  save = (course: Course): TE.TaskEither<Error, void> => {
    return TE.tryCatch(
      async () => {
        this.courses.push(course);
      },
      (reason: unknown) => reason as Error
    );
  };

  all = (): TE.TaskEither<Error, Course[]> => {
    return TE.right(this.courses);
  };
}
