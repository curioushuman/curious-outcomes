import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import { LoggableLogger } from '@curioushuman/loggable';

import { ParticipantSourceHydrationService } from '../participant-source-hydration.service';
import { CourseRepository } from '../../../adapter/ports/course.repository';
import { FakeCourseRepository } from '../../../adapter/implementations/fake/fake.course.repository';
import { CourseSourceRepository } from '../../../adapter/ports/course-source.repository';
import { FakeCourseSourceRepository } from '../../../adapter/implementations/fake/fake.course-source.repository';
import { ErrorFactory } from '../../../../../shared/domain/errors/error-factory';
import { FakeRepositoryErrorFactory } from '../../../../../shared/adapter/fake.repository.error-factory';
import { Course } from '../../../domain/entities/course';
import { CourseBuilder } from '../../../test/builders/course.builder';
import {
  ParticipantSource,
  ParticipantSourceHydrated,
} from '../../../domain/entities/participant-source';
import { ParticipantSourceBuilder } from '../../../test/builders/participant-source.builder';
import { executeTask } from '../../../../../shared/utils/execute-task';
import { SourceInvalidError } from '../../../../../shared/domain/errors/repository/source-invalid.error';
import { RepositoryItemNotFoundError } from '../../../../../shared/domain/errors/repository/item-not-found.error';

/**
 * UNIT TEST
 * SUT = participant source hydration service
 */

const feature = loadFeature('./participant-source-hydration.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let hydrationService: ParticipantSourceHydrationService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipantSourceHydrationService,
        LoggableLogger,
        { provide: CourseRepository, useClass: FakeCourseRepository },
        {
          provide: CourseSourceRepository,
          useClass: FakeCourseSourceRepository,
        },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    hydrationService = moduleRef.get<ParticipantSourceHydrationService>(
      ParticipantSourceHydrationService
    );
  });

  test('Successfully hydrate a Participant Source', ({
    given,
    and,
    when,
    then,
  }) => {
    let course: Course;
    let participantSource: ParticipantSource;
    let participantSourceHydrated: ParticipantSourceHydrated;
    let error: Error;

    given('I have a valid Participant Source', () => {
      participantSource = ParticipantSourceBuilder().courseExists().build();
    });

    and('a course exists that relates to the externalCourseId', () => {
      course = CourseBuilder().exists().build();
    });

    when('I attempt to hydrate', async () => {
      try {
        participantSourceHydrated = await executeTask(
          hydrationService.hydrate(participantSource)
        );
      } catch (err) {
        error = err;
        expect(error).toBeUndefined();
      }
    });

    then('a hydrated Participant Source should be returned', () => {
      expect(participantSourceHydrated).toBeDefined();
    });

    and('it should include a courseId related to externalCourseId', () => {
      expect(participantSourceHydrated.courseId).toEqual(course.id);
    });
  });

  test('Fail; Source does not include course', ({ given, when, then, and }) => {
    let participantSource: ParticipantSource;
    let participantSourceHydrated: ParticipantSourceHydrated;
    let error: Error;

    given('I have an invalid Participant Source', () => {
      participantSource = ParticipantSourceBuilder()
        .invalidSource()
        .buildNoCheck();
    });

    when('I attempt to hydrate', async () => {
      try {
        participantSourceHydrated = await executeTask(
          hydrationService.hydrate(participantSource)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });

    and('no result is returned', () => {
      expect(participantSourceHydrated).toBeUndefined();
    });
  });

  test('Fail; A related course could not be found', ({
    given,
    when,
    then,
    and,
  }) => {
    let participantSource: ParticipantSource;
    let participantSourceHydrated: ParticipantSourceHydrated;
    let error: Error;

    given('I have a valid Participant Source', () => {
      // below
    });

    and('a course DOES NOT exist that relates to the externalCourseId', () => {
      participantSource = ParticipantSourceBuilder()
        .courseDoesntExist()
        .buildNoCheck();
    });

    when('I attempt to hydrate', async () => {
      try {
        participantSourceHydrated = await executeTask(
          hydrationService.hydrate(participantSource)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(RepositoryItemNotFoundError);
    });

    and('no result is returned', () => {
      expect(participantSourceHydrated).toBeUndefined();
    });
  });
});
