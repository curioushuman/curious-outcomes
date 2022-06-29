import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule, CommandBus } from '@nestjs/cqrs';
import { loadFeature, defineFeature } from 'jest-cucumber';

import { LoggableLogger } from '@curioushuman/loggable';

import { EventsController } from '../../events.controller';
import { TransformEventRequestDto } from '../../dto/transform-event.request.dto';
import { EventBuilder } from '../../../test/builders/event.builder';
import { EventTransformerService } from '../../../application/services/event-transformer/event-transformer.service';
import { CoEvent } from '../../../domain/entities/co-event';

/**
 * UNIT TEST
 * SUT = the controller
 *
 * Scope
 * - validation of request
 * - transformation of request
 * - calling external services
 */

const feature = loadFeature('./event-transformer.feature', {
  loadRelativePath: true,
});

// We only need this so controller doesn't complain
const commandBus = {
  transform: jest.fn(),
};

defineFeature(feature, (test) => {
  let controller: EventsController;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [EventsController],
      providers: [
        LoggableLogger,
        EventTransformerService,
        { provide: CommandBus, useValue: commandBus },
      ],
    }).compile();

    controller = moduleRef.get<EventsController>(EventsController);
    jest.clearAllMocks();
  });

  test('Successfully transforming external event to event', ({
    given,
    when,
    then,
  }) => {
    let transformEventRequestDto: TransformEventRequestDto;
    let event: CoEvent;

    given('the request is valid', () => {
      transformEventRequestDto = EventBuilder()
        .courseSourceCreated()
        .buildRequestDto();
    });

    when('I attempt to transform an event', async () => {
      event = await controller.transform(transformEventRequestDto);
    });

    then('a matching event should be returned', () => {
      expect(event).toBeDefined();
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let transformEventRequestDto: TransformEventRequestDto;
    let error: Error;

    given('the request contains invalid data', () => {
      transformEventRequestDto = EventBuilder().invalid().buildRequestDto();
    });

    when('I attempt to transform an event', async () => {
      try {
        await controller.transform(transformEventRequestDto);
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RequestInvalidError', () => {
      expect(error).toBeInstanceOf(BadRequestException);
    });
  });
});
