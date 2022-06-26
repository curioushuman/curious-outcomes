import { Controller, Post, Body } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { LoggableLogger } from '@curioushuman/loggable';

import { executeTask } from '../../../shared/utils/execute-task';
import { CreateCourseRequestDto } from './dto/create-course.request.dto';
import { CreateCourseMapper } from '../application/commands/create-course/create-course.mapper';
import { CreateCourseCommand } from '../application/commands/create-course/create-course.command';
import { parseActionData } from '../../../shared/utils/parse-action-data';
import { CreateParticipantRequestDto } from './dto/create-participant.request.dto';
import { CreateParticipantMapper } from '../application/commands/create-participant/create-participant.mapper';
import { CreateParticipantCommand } from '../application/commands/create-participant/create-participant.command';

/**
 * Controller for courses; transforming input/output and routing to commands
 */

@Controller('courses')
export class CoursesController {
  constructor(
    private logger: LoggableLogger,
    private readonly commandBus: CommandBus
  ) {
    this.logger.setContext('CoursesController');
  }

  @Post()
  async create(@Body() body: CreateCourseRequestDto): Promise<void> {
    const task = pipe(
      body,

      // #1. parse the dto
      parseActionData(CreateCourseRequestDto.check, this.logger),
      TE.chain((createCourseRequestDto) =>
        parseActionData(
          CreateCourseMapper.fromRequestDto,
          this.logger
        )(createCourseRequestDto)
      ),

      // #2. call the command (to create the course)
      // NOTE: errors already converted by the command
      TE.chain((createCourseDto) =>
        TE.tryCatch(
          async () => {
            const command = new CreateCourseCommand(createCourseDto);
            return await this.commandBus.execute<CreateCourseCommand>(command);
          },
          (error: Error) => error as Error
        )
      )
    );

    return executeTask(task);
  }

  @Post('participants')
  async createParticipant(
    @Body() body: CreateParticipantRequestDto
  ): Promise<void> {
    const task = pipe(
      body,

      // #1. parse the dto
      parseActionData(CreateParticipantRequestDto.check, this.logger),
      TE.chain((createParticipantRequestDto) =>
        parseActionData(
          CreateParticipantMapper.fromRequestDto,
          this.logger
        )(createParticipantRequestDto)
      ),

      // #2. call the command (to create the course)
      // NOTE: errors already converted by the command
      TE.chain((createParticipantDto) =>
        TE.tryCatch(
          async () => {
            const command = new CreateParticipantCommand(createParticipantDto);
            return await this.commandBus.execute<CreateParticipantCommand>(
              command
            );
          },
          (error: Error) => error as Error
        )
      )
    );

    return executeTask(task);
  }
}
