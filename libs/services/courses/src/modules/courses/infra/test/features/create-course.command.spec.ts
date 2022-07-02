import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule, CommandBus } from '@nestjs/cqrs';
import { loadFeature, defineFeature } from 'jest-cucumber';

import { LoggableLogger } from '@curioushuman/loggable';

import { CoursesController } from '../../courses.controller';
import { CreateCourseRequestDto } from '../../dto/create-course.request.dto';
import { ErrorFactory } from '../../../../../shared/domain/errors/error-factory';
import { FakeRepositoryErrorFactory } from '../../../../../shared/adapter/fake.repository.error-factory';
import { CourseBuilder } from '../../../test/builders/course.builder';

/**
 * UNIT TEST
 * SUT = the controller
 *
 * Scope
 * - validation of request
 * - transformation of request
 * - calling the command/query
 */

const feature = loadFeature('./create-course.command.feature', {
  loadRelativePath: true,
});

const commandBus = {
  execute: jest.fn(),
};

defineFeature(feature, (test) => {
  let controller: CoursesController;
  let createCourseRequestDto: CreateCourseRequestDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [CoursesController],
      providers: [
        LoggableLogger,
        { provide: CommandBus, useValue: commandBus },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    controller = moduleRef.get<CoursesController>(CoursesController);
    jest.clearAllMocks();
  });

  test('Successfully creating a course', ({ given, when, then }) => {
    let executeSpy: jest.SpyInstance;

    beforeAll(async () => {
      executeSpy = jest.spyOn(commandBus, 'execute');
    });

    given('the request is valid', () => {
      // we test request validity in controller
      // here we assume it is valid, and has been transformed into valid command dto
      createCourseRequestDto = CourseBuilder().buildRequestDto();
    });

    when('I attempt to create a course', async () => {
      await controller.create(createCourseRequestDto);
    });

    then('a new record should have been created', () => {
      expect(executeSpy).toHaveBeenCalled();
    });
  });

  test('Fail; Invalid request, invalid data', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      createCourseRequestDto = CourseBuilder().invalid().buildRequestDto();
    });

    when('I attempt to create a course', async () => {
      try {
        await controller.create(createCourseRequestDto);
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(BadRequestException);
    });
  });
});
