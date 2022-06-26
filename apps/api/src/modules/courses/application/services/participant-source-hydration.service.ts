import { Injectable } from '@nestjs/common';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';

import { LoggableLogger } from '@curioushuman/loggable';

import { CourseRepository } from '../../adapter/ports/course.repository';
import { ErrorFactory } from '../../../../shared/domain/errors/error-factory';
import {
  ParticipantSource,
  ParticipantSourceHydrated,
} from '../../domain/entities/participant-source';
import { ParticipantSourceHydrationMapper } from './participant-source-hydration.mapper';
import { parseActionData } from '../../../../shared/utils/parse-action-data';
import { performAction } from '../../../../shared/utils/perform-action';
import { Course } from '../../domain/entities/course';

@Injectable()
export class ParticipantSourceHydrationService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private logger: LoggableLogger,
    private errorFactory: ErrorFactory
  ) {
    this.logger.setContext(ParticipantSourceHydrationService.name);
  }

  /**
   * If you had additional async hydrations
   * you could run them concurrently using
   * one of the fp-ts sequence approaches
   */
  hydrate = (
    participantSource: ParticipantSource
  ): TE.TaskEither<Error, ParticipantSourceHydrated> => {
    return pipe(
      participantSource,
      this.hydrateCourse,
      TE.chain((sourceHydrated) =>
        pipe(
          sourceHydrated,
          parseActionData(
            ParticipantSourceHydrated.check,
            this.logger,
            'SourceInvalidError'
          )
        )
      )
    );
  };

  /**
   * TODO
   * - [ ] could this benefit from some caching?
   *       e.g. if we're hydrating several items at once
   *       NOTE: here you are only grabbing courseId
   *       but during a GET list call you might be grabbing more.
   *       Remember this when you come back here
   */
  hydrateCourse = (
    participantSource: ParticipantSource
  ): TE.TaskEither<Error, ParticipantSource> => {
    return pipe(
      participantSource,
      parseActionData(
        ParticipantSourceHydrationMapper.fromSourceToFindCourseDto,
        this.logger,
        'SourceInvalidError'
      ),
      TE.chain((findCourseDto) =>
        performAction(
          findCourseDto,
          this.courseRepository.findOne,
          this.errorFactory,
          this.logger,
          'find course for participant hydration'
        )
      ),
      TE.chain((course) => this.hydrateWithCourse(participantSource, course))
    );
  };

  /**
   * Here you could do additional checking if you wanted to
   * CourseRepository will throw a 404 error if nothing found
   */
  hydrateWithCourse = (
    participantSource: ParticipantSource,
    course: Course
  ): TE.TaskEither<Error, ParticipantSource> => {
    const sourceWithCourse = { ...participantSource, courseId: course.id };
    return TE.right(sourceWithCourse);
  };
}
