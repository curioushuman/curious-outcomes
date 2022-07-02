import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { loadFeature, defineFeature } from 'jest-cucumber';

import { CoursesModule } from './fake.courses.module';
import { FindCourseRequestDto } from '../infra/dto/find-course.request.dto';
import { Course } from '../domain/entities/course';
import { CourseBuilder } from './builders/course.builder';
import { FindCourseController } from '../infra/find-course.controller';
import { CourseResponseDto } from '../infra/dto/course.response.dto';
import { RequestInvalidError } from '@curioushuman/error-factory';

/**
 * INTEGRATION TEST
 * Making sure all our bits work together
 * Without worrying about third parties
 *
 * Scope
 * - sending request
 * - receiving response
 */

const feature = loadFeature('./find-course.query.feature', {
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
    controller = moduleRef.get<FindCourseController>(FindCourseController);
  });

  afterAll(async () => {
    await app.close();
  });

  test('Success; found requested course', ({ given, and, when, then }) => {
    let requestDto: FindCourseRequestDto;
    let course: Course;
    let courseResponse: CourseResponseDto;
    let error: Error;

    given('the request is valid', () => {
      requestDto = CourseBuilder().exists().buildFindRequestDto();
    });

    and('a matching record exists', () => {
      course = CourseBuilder().exists().build();
    });

    when('I attempt to find a course', async () => {
      try {
        courseResponse = await controller.find(requestDto);
      } catch (err) {
        error = err;
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
        courseResponse = await controller.find(requestDto);
        expect(courseResponse).toBeUndefined();
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError/BadRequestException', () => {
      expect(error).toBeInstanceOf(RequestInvalidError);
    });
  });
});
