import { QueryBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { FindCourseRequestDto } from './dto/find-course.request.dto';
import { CourseResponseDto } from './dto/course.response.dto';
import { FindCourseMapper } from '../application/queries/find-course/find-course.mapper';
import { FindCourseQuery } from '../application/queries/find-course/find-course.query';
import { FindCourseSourceRequestDto } from './dto/find-course-source.request.dto';
import { CourseSourceResponseDto } from './dto/course-source.response.dto';
import { FindCourseSourceMapper } from '../application/queries/find-course-source/find-course-source.mapper';
import { FindCourseSourceQuery } from '../application/queries/find-course-source/find-course-source.query';

/**
 * Controller for find(One) course operations
 *
 * TODO
 * - [ ] should this actually be a service?
 * - [ ] should we be doing auth. here as well?
 *       OR is it ok that we're assuming it is done at higher levels?
 *       AKA it seems like a waste of resources to repeat the same task
 *       ONLY if auth. at this level differs from higher ups should we implement
 *
 * NOTES
 * - should we have findBySlug and findById
 *   OR find, with a single DTO?
 * - where should the check for slug vs id be done?
 */

export class FindCourseController {
  constructor(
    private logger: LoggableLogger,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(FindCourseController.name);
  }

  public async find(
    requestDto: FindCourseRequestDto
  ): Promise<CourseResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(FindCourseRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain((dto) =>
        parseActionData(FindCourseMapper.fromRequestDto, this.logger)(dto)
      ),

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
      TE.chain((course) =>
        parseActionData(FindCourseMapper.toResponseDto, this.logger)(course)
      )
    );

    return executeTask(task);
  }

  public async findSource(
    requestDto: FindCourseSourceRequestDto
  ): Promise<CourseSourceResponseDto> {
    const task = pipe(
      requestDto,

      // #1. parse the dto
      parseActionData(FindCourseSourceRequestDto.check, this.logger),

      // #2. transform the dto
      TE.chain((dto) =>
        parseActionData(FindCourseSourceMapper.fromRequestDto, this.logger)(dto)
      ),

      // #3. call the query
      // NOTE: proper error handling within the query itself
      TE.chain((queryDto) =>
        TE.tryCatch(
          async () => {
            const query = new FindCourseSourceQuery(queryDto);
            return await this.queryBus.execute<FindCourseSourceQuery>(query);
          },
          (error: unknown) => error as Error
        )
      ),

      // #4. transform the query result
      TE.chain((courseSource) =>
        parseActionData(
          FindCourseSourceMapper.toResponseDto,
          this.logger
        )(courseSource)
      )
    );

    return executeTask(task);
  }

  // async create(requestDto: CreateCourseRequestDto): Promise<void> {
  //   const task = pipe(
  //     requestDto,

  //     // #1. parse the dto
  //     parseActionData(CreateCourseRequestDto.check, this.logger),
  //     TE.chain((createCourseRequestDto) =>
  //       parseActionData(
  //         CreateCourseMapper.fromRequestDto,
  //         this.logger
  //       )(createCourseRequestDto)
  //     ),

  //     // #2. call the command (to create the course)
  //     // NOTE: errors already converted by the command
  //     TE.chain((createCourseDto) =>
  //       TE.tryCatch(
  //         async () => {
  //           const command = new CreateCourseCommand(createCourseDto);
  //           return await this.commandBus.execute<CreateCourseCommand>(command);
  //         },
  //         (error: Error) => error as Error
  //       )
  //     )
  //   );

  //   return executeTask(task);
  // }
}
