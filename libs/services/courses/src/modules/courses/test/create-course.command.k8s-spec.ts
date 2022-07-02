import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { loadFeature, defineFeature } from 'jest-cucumber';

import { Bootstrap } from '../../../bootstrap/bootstrap';
import { AppModule } from '../../../app/app.module';
import { CreateCourseRequestDto } from '../infra/dto/create-course.request.dto';
import { MongoDbService } from '../../../shared/infra/database/mongo-db/mongo-db.service';
import { CourseManufacturer } from '../adapter/implementations/mongo-db/test/builders/course.manufacturer';
import { CourseSourceManufacturer } from '../adapter/implementations/salesforce-api/test/builders/course-source.manufacturer';
import { CourseBuilder } from './builders/course.builder';
import { Course } from '../domain/entities/course';
import { CourseSource } from '../domain/entities/course-source';

/**
 * E2E TEST
 * All the things; inc. DB, and externals
 *
 * Scope
 * - sending request
 * - receiving response
 *
 * * NOTE: these often (still) fail due to timeout the first time you run skaffold dev
 * * If you make an additional minor change they'll run again and pass (grrr)
 */

jest.setTimeout(25000);

const feature = loadFeature('./create-course.command.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let connection: Connection;
  let httpService: HttpService;
  let testingContext: string;
  let courseManufacturer: CourseManufacturer;
  let courseSourceManufacturer: CourseSourceManufacturer;
  // disabling no-explicit-any for testing purposes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let httpServer: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    Bootstrap.useGlobalSettings(app);
    await app.init();
    httpServer = app.getHttpServer();
    connection = moduleRef.get<MongoDbService>(MongoDbService).getConnection();
    httpService = moduleRef.get<HttpService>(HttpService);

    testingContext = 'create-course-command';
    courseManufacturer = new CourseManufacturer(connection, testingContext);
    courseSourceManufacturer = new CourseSourceManufacturer(
      httpService,
      testingContext
    );
  });

  afterAll(async () => {
    await courseManufacturer.tidyUp();
    await courseSourceManufacturer.tidyUp();
    await connection.close();
    await app.close();
  });

  test('Successfully creating a course', ({ given, and, when, then }) => {
    let response: request.Response;
    let course: Course;
    let courseSource: CourseSource;
    let createCourseRequestDto: CreateCourseRequestDto;

    given('the request is valid', async () => {
      courseSource = await courseSourceManufacturer.build();
      course = CourseBuilder().fromSource(courseSource).build();
      createCourseRequestDto = CourseBuilder()
        .fromSource(courseSource)
        .buildRequestDto();
    });

    and('a matching record is found at the source', () => {
      // handled in previous
    });

    when('I attempt to create a course', async () => {
      response = await request(httpServer)
        .post(`/api/courses`)
        .send(createCourseRequestDto);
    });

    then('a new record should have been created', async () => {
      const courseCreated = await courseManufacturer.check(course);
      expect(courseCreated?.externalId).toEqual(
        createCourseRequestDto.externalId
      );
    });

    and('a positive response received', () => {
      expect(response.status).toBe(201);
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let response: request.Response;
    let createCourseRequestDto: CreateCourseRequestDto;

    given('the request contains invalid data', () => {
      createCourseRequestDto = CourseBuilder().invalid().buildRequestDto();
    });

    when('I attempt to create a course', async () => {
      response = await request(httpServer)
        .post(`/api/courses`)
        .send(createCourseRequestDto);
    });

    then('I should receive a RequestInvalidError/BadRequestException', () => {
      expect(response.status).toBe(400);
    });
  });

  test('Fail; Source not found for ID provided', ({
    given,
    and,
    when,
    then,
  }) => {
    let response: request.Response;
    let createCourseRequestDto: CreateCourseRequestDto;

    given('the request is valid', () => {
      // true
    });

    and('no record exists that matches our request', () => {
      createCourseRequestDto = CourseBuilder()
        .noMatchingSource()
        .buildRequestDto();
    });

    when('I attempt to create a course', async () => {
      response = await request(httpServer)
        .post(`/api/courses`)
        .send(createCourseRequestDto);
    });

    then(
      'I should receive a RepositoryItemNotFoundError/NotFoundException',
      () => {
        expect(response.status).toBe(404);
      }
    );
  });

  test('Fail; Source already exists in our DB', ({
    given,
    and,
    when,
    then,
  }) => {
    let response: request.Response;
    let course: Course;
    let courseSource: CourseSource;
    let createCourseRequestDto: CreateCourseRequestDto;

    given('the request is valid', () => {
      // true
    });

    and('a matching record is found at the source', async () => {
      courseSource = await courseSourceManufacturer.build();
    });

    and('the returned source populates a valid course', () => {
      createCourseRequestDto = CourseBuilder()
        .fromSource(courseSource)
        .buildRequestDto();
    });

    and('the source DOES already exist in our DB', async () => {
      course = CourseBuilder().fromSource(courseSource).build();
      course = await courseManufacturer.build(course);
    });

    when('I attempt to create a course', async () => {
      response = await request(httpServer)
        .post(`/api/courses`)
        .send(createCourseRequestDto);
    });

    then(
      'I should receive an RepositoryItemConflictError/ConflictException',
      () => {
        expect(response.status).toBe(409);
      }
    );
  });
});
