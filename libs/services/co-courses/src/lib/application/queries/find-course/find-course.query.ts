import { IQueryHandler, IQuery, QueryHandler } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { ErrorFactory } from '@curioushuman/error-factory';
import {
  executeTask,
  parseActionData,
  performAction,
} from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { CourseRepository } from '../../../adapter/ports/course.repository';
import { FindCourseDto } from './find-course.dto';
import { Course } from '../../../domain/entities/course';

export class FindCourseQuery implements IQuery {
  constructor(public readonly findCourseDto: FindCourseDto) {}
}

/**
 * Query handler for find course
 */
@QueryHandler(FindCourseQuery)
export class FindCourseHandler implements IQueryHandler<FindCourseQuery> {
  constructor(
    private readonly courseRepository: CourseRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(FindCourseHandler.name);
  }

  async execute(query: FindCourseQuery): Promise<Course> {
    const { findCourseDto } = query;

    const task = pipe(
      findCourseDto,

      // #1. parse the dto
      parseActionData(FindCourseDto.check, this.logger, 'RequestInvalidError'),

      // #2. find the course
      TE.chain((dto) =>
        performAction(
          dto,
          this.courseRepository.findOne,
          this.errorFactory,
          this.logger,
          'find course'
        )
      )
    );

    return executeTask(task);
  }
}
