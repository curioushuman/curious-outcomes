import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { loadFeature, defineFeature } from 'jest-cucumber';

import {
  RepositoryItemNotFoundError,
  RequestInvalidError,
} from '@curioushuman/error-factory';

import { CoursesModule } from '../../../test/courses.module.fake';
import { FindCourseModule } from '../../../find-course.module';
import { FindCourseRequestDto } from '../dto/find-course.request.dto';
import { Course } from '../../../domain/entities/course';
import { CourseBuilder } from '../../../test/builders/course.builder';
import { FindCourseController } from '../../../infra/find-course/find-course.controller';
import { CourseResponseDto } from '../../../infra/dto/course.response.dto';

/**
 * E2E TEST
 * Making sure all our bits work together
 * Without worrying about third parties
 *
 * NOTE: This is defined as an E2E test as we are employing Nest in
 *       standalone mode. Therefore there is no Express server, only
 *       the controller. It is the entry and exit point to the application.
 *
 * Scope
 * - sending request
 * - receiving response
 */

const feature = loadFeature('./find-course.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let controller: FindCourseController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CoursesModule],
    }).compile();

    app = moduleRef.createNestApplication();

    await app.init();
    FindCourseModule.applyDefaults(app);
    controller = moduleRef.get<FindCourseController>(FindCourseController);
  });

  afterAll(async () => {
    await app.close();
  });

  test('Success; found course by Id', ({ given, and, when, then }) => {
    let requestDto: FindCourseRequestDto;
    let course: Course;
    let courseResponse: CourseResponseDto;
    let error: Error;

    given('the request is valid', () => {
      requestDto = {
        id: CourseBuilder().exists().build().id,
      };
    });

    and('a matching record exists', () => {
      course = CourseBuilder().exists().build();
    });

    when('I attempt to find a course', async () => {
      try {
        courseResponse = await controller.findOne(requestDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('the matching course is returned', () => {
      expect(courseResponse.id).toEqual(course.id);
    });
  });

  test('Success; found course by External Id', ({ given, and, when, then }) => {
    let requestDto: FindCourseRequestDto;
    let course: Course;
    let courseResponse: CourseResponseDto;
    let error: Error;

    given('the request is valid', () => {
      requestDto = {
        externalId: CourseBuilder().exists().build().externalId,
      };
    });

    and('a matching record exists', () => {
      course = CourseBuilder().exists().build();
    });

    when('I attempt to find a course', async () => {
      try {
        courseResponse = await controller.findOne(requestDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('the matching course is returned', () => {
      expect(courseResponse.id).toEqual(course.id);
    });
  });

  test('Success; found course by Slug', ({ given, and, when, then }) => {
    let requestDto: FindCourseRequestDto;
    let course: Course;
    let courseResponse: CourseResponseDto;
    let error: Error;

    given('the request is valid', () => {
      requestDto = {
        slug: CourseBuilder().exists().build().slug,
      };
    });

    and('a matching record exists', () => {
      course = CourseBuilder().exists().build();
    });

    when('I attempt to find a course', async () => {
      try {
        courseResponse = await controller.findOne(requestDto);
      } catch (err) {
        error = err as Error;
        expect(error).toBeUndefined();
      }
    });

    then('the matching course is returned', () => {
      expect(courseResponse.id).toEqual(course.id);
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let requestDto: FindCourseRequestDto;
    let courseResponse: CourseResponseDto;
    let error: Error;

    given('the request is invalid', () => {
      requestDto = CourseBuilder().invalid().buildFindRequestDto();
    });

    when('I attempt to find a course', async () => {
      try {
        courseResponse = await controller.findOne(requestDto);
        expect(courseResponse).toBeUndefined();
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });

  test('Fail; Invalid identifier', ({ given, when, then }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let requestDto: any;
    let courseResponse: CourseResponseDto;
    let error: Error;

    given('the identifier is invalid', () => {
      requestDto = {
        someIdentifier: 'some-value',
      };
    });

    when('I attempt to find a course', async () => {
      try {
        courseResponse = await controller.findOne(requestDto);
        expect(courseResponse).toBeUndefined();
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });

  test('Fail; course not found by Id', ({ given, and, when, then }) => {
    let requestDto: FindCourseRequestDto;
    let courseResponse: CourseResponseDto;
    let error: Error;

    given('the request is valid', () => {
      // see next
    });

    and('no record exists that matches our request', () => {
      requestDto = CourseBuilder().doesntExistId().buildFindRequestDto();
    });

    when('I attempt to find a course', async () => {
      try {
        courseResponse = await controller.findOne(requestDto);
        expect(courseResponse).toBeUndefined();
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(RepositoryItemNotFoundError);
    });
  });

  test('Fail; course not found by other than Id', ({
    given,
    and,
    when,
    then,
  }) => {
    let requestDto: FindCourseRequestDto;
    let courseResponse: CourseResponseDto;
    let error: Error;

    given('the request is valid', () => {
      // see next
    });

    and('no record exists that matches our request', () => {
      requestDto = CourseBuilder().doesntExist().buildFindRequestDto();
    });

    when('I attempt to find a course', async () => {
      try {
        courseResponse = await controller.findOne(requestDto);
        expect(courseResponse).toBeUndefined();
      } catch (err) {
        error = err as Error;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(RepositoryItemNotFoundError);
    });
  });
});
