import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { FindCourseRequestDto } from './dto/find-course.request.dto';
import { CourseResponseDto } from '../dto/course.response.dto';
import { FindCourseMapper } from '../../application/queries/find-course/find-course.mapper';
import { FindCourseQuery } from '../../application/queries/find-course/find-course.query';
import { CoursesMapper } from '../courses.mapper';

/**
 * Controller for find(One) course operations
 *
 * TODO
 * - [ ] should this actually be a service?
 * - [ ] should we be doing auth. here as well?
 *       OR is it ok that we're assuming it is done at higher levels?
 *       AKA it seems like a waste of resources to repeat the same task
 *       ONLY if auth. at this level differs from higher ups should we implement
 */

@Controller()
export class FindCourseController {
  constructor(
    private logger: LoggableLogger,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(FindCourseController.name);
  }

  public async findOne(
    requestDto: FindCourseRequestDto
  ): Promise<CourseResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(FindCourseRequestDto.check, this.logger),

      // #2. transform the dto
      // NOTE: during this transformation the most relevant identifier is surfaced
      // or an error is thrown
      TE.chain(parseActionData(FindCourseMapper.fromRequestDto, this.logger)),

      // #3. call the query
      // NOTE: proper error handling within the query itself
      TE.chain((queryDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindCourseQuery(queryDto);
            return await this.queryBus.execute<FindCourseQuery>(query);
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. transform the query result
      TE.chain(parseActionData(CoursesMapper.toResponseDto, this.logger))
    );

    return executeTask(task);
  }
}
