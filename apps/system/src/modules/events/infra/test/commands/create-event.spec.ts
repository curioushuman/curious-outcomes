import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule, CommandBus } from '@nestjs/cqrs';
import { loadFeature, defineFeature } from 'jest-cucumber';

import { LoggableLogger } from '@curioushuman/loggable';

import { EventsController } from '../../events.controller';
import { CreateEventRequestDto } from '../../dto/create-event.request.dto';
import { ErrorFactory } from '../../../../../shared/domain/errors/error-factory';
import { FakeRepositoryErrorFactory } from '../../../../../shared/adapter/fake.repository.error-factory';
import { EventBuilder } from '../../../test/builders/event.builder';

/**
 * UNIT TEST
 * SUT = the controller
 *
 * Scope
 * - validation of request
 * - transformation of request
 * - calling the command/query
 */

const feature = loadFeature('./create-event.command.feature', {
  loadRelativePath: true,
});

const commandBus = {
  execute: jest.fn(),
};

defineFeature(feature, (test) => {
  let controller: EventsController;
  let createEventRequestDto: CreateEventRequestDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [EventsController],
      providers: [
        LoggableLogger,
        { provide: CommandBus, useValue: commandBus },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    controller = moduleRef.get<EventsController>(EventsController);
    jest.clearAllMocks();
  });

  test('Successfully creating a Event', ({ given, when, then }) => {
    let executeSpy: jest.SpyInstance;

    beforeAll(async () => {
      executeSpy = jest.spyOn(commandBus, 'execute');
    });

    given('the request is valid', () => {
      // we test request validity in controller
      // here we assume it is valid, and has been transformed into valid command dto
      createEventRequestDto = EventBuilder().buildRequestDto();
    });

    when('I attempt to create a Event', async () => {
      await controller.create(createEventRequestDto);
    });

    then('a new record should have been created', () => {
      expect(executeSpy).toHaveBeenCalled();
    });
  });

  test('Fail; Invalid request, invalid data', ({ given, when, then }) => {
    let error: Error;

    given('the request contains invalid data', () => {
      createEventRequestDto = EventBuilder().invalid().buildRequestDto();
    });

    when('I attempt to create a Event', async () => {
      try {
        await controller.create(createEventRequestDto);
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(BadRequestException);
    });
  });
});
