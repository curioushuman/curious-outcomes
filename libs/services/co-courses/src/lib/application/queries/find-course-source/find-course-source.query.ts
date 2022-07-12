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

import { CourseSourceRepository } from '../../../adapter/ports/course-source.repository';
import { FindCourseSourceDto } from './find-course-source.dto';
import { CourseSource } from '../../../domain/entities/course-source';

export class FindCourseSourceQuery implements IQuery {
  constructor(public readonly findCourseSourceDto: FindCourseSourceDto) {}
}

/**
 * Query handler for find course-source
 */
@QueryHandler(FindCourseSourceQuery)
export class FindCourseSourceHandler
  implements IQueryHandler<FindCourseSourceQuery>
{
  constructor(
    private readonly courseSourceRepository: CourseSourceRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(FindCourseSourceHandler.name);
  }

  async execute(query: FindCourseSourceQuery): Promise<CourseSource> {
    const { findCourseSourceDto } = query;

    const task = pipe(
      findCourseSourceDto,

      // #1. parse the dto
      parseActionData(
        FindCourseSourceDto.check,
        this.logger,
        'RequestInvalidError'
      ),

      // #2. find the course-source
      TE.chain((dto) =>
        performAction(
          dto,
          this.courseSourceRepository.findOne,
          this.errorFactory,
          this.logger,
          'find course-source'
        )
      )
    );

    return executeTask(task);
  }
}
