import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { loadFeature, defineFeature } from 'jest-cucumber';

import { CoursesModule } from './fake.courses.module';
import { FindCourseRequestDto } from '../infra/dto/find-course.request.dto';
import { Course } from '../domain/entities/course';
import { CourseBuilder } from './builders/course.builder';
import { FindCourseController } from '../infra/find-course.controller';

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
    let courseFound: Course;
    let error: Error;

    given('the request is valid', () => {
      requestDto = CourseBuilder().buildFindRequestDto();
    });

    and('a matching record exists', () => {
      course = CourseBuilder().build();
    });

    when('I attempt to find a course', async () => {
      try {
        courseFound = await controller.find(requestDto);
      } catch (err) {
        error = err;
      }
    });

    then('the matching course is returned', () => {
      expect(courseFound).toEqual(course);
    });
  });
});
