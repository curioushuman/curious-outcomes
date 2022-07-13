import { Controller } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { executeTask, parseActionData } from '@curioushuman/fp-ts-utils';
import { LoggableLogger } from '@curioushuman/loggable';

import { CourseResponseDto } from './dto/course.response.dto';
import { CourseSourceResponseDto } from './dto/course-source.response.dto';
// import { CreateCourseRequestDto } from './dto/create-course.request.dto';

/**
 * Controller for courses; transforming input/output and routing to commands
 *
 * TODO
 * - [ ] experiment with breaking this file into individual controllers
 *       e.g. find-course.controller.ts
 *       To make the most of it, you'd also need find-course.module.ts
 *       Only worth doing if you're measuring at the same time
 */

@Controller('courses')
export class CoursesController {
  constructor(
    private logger: LoggableLogger,
    private readonly queryBus: QueryBus
  ) {
    this.logger.setContext(CoursesController.name);
  }

  // public async findSource(
  //   requestDto: FindCourseSourceRequestDto
  // ): Promise<CourseSourceResponseDto> {
  //   const task = pipe(
  //     requestDto,

  //     // #1. parse the dto
  //     parseActionData(FindCourseSourceRequestDto.check, this.logger),

  //     // #2. transform the dto
  //     TE.chain((dto) =>
  //       parseActionData(FindCourseSourceMapper.fromRequestDto, this.logger)(dto)
  //     ),

  //     // #3. call the query
  //     // NOTE: proper error handling within the query itself
  //     TE.chain((queryDto) =>
  //       TE.tryCatch(
  //         async () => {
  //           const query = new FindCourseSourceQuery(queryDto);
  //           return await this.queryBus.execute<FindCourseSourceQuery>(query);
  //         },
  //         (error: unknown) => error as Error
  //       )
  //     ),

  //     // #4. transform the query result
  //     TE.chain((courseSource) =>
  //       parseActionData(
  //         FindCourseSourceMapper.toResponseDto,
  //         this.logger
  //       )(courseSource)
  //     )
  //   );

  //   return executeTask(task);
  // }

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
