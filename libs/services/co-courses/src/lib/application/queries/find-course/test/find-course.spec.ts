import { Test, TestingModule } from '@nestjs/testing';
import { loadFeature, defineFeature } from 'jest-cucumber';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
  RepositoryItemNotFoundError,
  RequestInvalidError,
} from '@curioushuman/error-factory';
import { LoggableLogger } from '@curioushuman/loggable';

import { Course } from '../../../../domain/entities/course';
import { CourseBuilder } from '../../../../test/builders/course.builder';
import { FindCourseHandler, FindCourseQuery } from '../find-course.query';
import { CourseRepository } from '../../../../adapter/ports/course.repository';
import { FakeCourseRepository } from '../../../../adapter/implementations/fake/fake.course.repository';
import { FindCourseDto } from '../find-course.dto';

/**
 * UNIT TEST
 * SUT = the query & query handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./find-course.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let handler: FindCourseHandler;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        FindCourseHandler,
        LoggableLogger,
        { provide: CourseRepository, useClass: FakeCourseRepository },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    handler = moduleRef.get<FindCourseHandler>(FindCourseHandler);
  });

  test('Success; found course by Id', ({ given, and, when, then }) => {
    let dto: FindCourseDto;
    let course: Course;
    let result: Course;
    let error: Error;

    given('the request is valid', () => {
      dto = {
        id: CourseBuilder().exists().build().id,
      };
    });

    and('a matching record exists', () => {
      course = CourseBuilder().exists().build();
    });

    when('I attempt to find a course', async () => {
      try {
        result = await handler.execute(new FindCourseQuery(dto));
      } catch (err) {
        error = err;
        expect(error).toBeUndefined();
      }
    });

    then('the matching course is returned', () => {
      expect(result.id).toEqual(course.id);
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let dto: FindCourseDto;
    let result: Course;
    let error: Error;

    given('the request is invalid', () => {
      dto = CourseBuilder().invalid().buildFindDto();
    });

    when('I attempt to find a course', async () => {
      try {
        result = await handler.execute(new FindCourseQuery(dto));
        expect(result).toBeUndefined();
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });

  test('Fail; course not found', ({ given, and, when, then }) => {
    let dto: FindCourseDto;
    let result: Course;
    let error: Error;

    given('the request is valid', () => {
      dto = CourseBuilder().doesntExist().buildFindDto();
    });

    and('no record exists that matches our request', () => {
      // see previous
    });

    when('I attempt to find a course', async () => {
      try {
        result = await handler.execute(new FindCourseQuery(dto));
        expect(result).toBeUndefined();
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(RepositoryItemNotFoundError);
    });
  });
});
