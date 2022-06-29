import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import { LoggableLogger } from '@curioushuman/loggable';
import { executeTask } from '@curioushuman/fp-ts-utils';

import { EventTransformerService } from '../event-transformer.service';
import { TransformEventRequestDto } from '../../../../infra/dto/transform-event.request.dto';
import { CoEvent } from '../../../../domain/entities/co-event';
import { EventBuilder } from '../../../../test/builders/event.builder';
import { EventNotFoundError } from '../../../../domain/errors/event-not-found.error';

/**
 * UNIT TEST
 * SUT = event transformer service
 */

const feature = loadFeature('./event-transformer.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let transformerService: EventTransformerService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [EventTransformerService, LoggableLogger],
    }).compile();

    transformerService = moduleRef.get<EventTransformerService>(
      EventTransformerService
    );
  });

  test('Successfully transforming external event to event', ({
    given,
    when,
    then,
  }) => {
    let transformEventRequestDto: TransformEventRequestDto;
    let event: CoEvent;
    let error: Error;

    given('the request is valid', () => {
      transformEventRequestDto = EventBuilder()
        .courseSourceCreated()
        .buildRequestDto();
    });

    when('I attempt to transform an event', async () => {
      try {
        event = await executeTask(
          transformerService.transform(transformEventRequestDto)
        );
      } catch (err) {
        error = err;
        expect(error).toBeUndefined();
      }
    });

    then('a matching event should be returned', () => {
      expect(event).toBeDefined();
      expect(event.payload.id).toBe(transformEventRequestDto.data.id);
    });
  });

  test('Fail; Event not found', ({ given, when, then }) => {
    let transformEventRequestDto: TransformEventRequestDto;
    let event: CoEvent;
    let error: Error;

    given('the request does not relate to an internal event', () => {
      transformEventRequestDto = EventBuilder()
        .unrelatedEvent()
        .buildRequestDto();
    });

    when('I attempt to transform an event', async () => {
      try {
        event = await executeTask(
          transformerService.transform(transformEventRequestDto)
        );
        expect(event).toBeUndefined();
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a EventNotFoundError', () => {
      expect(error).toBeInstanceOf(EventNotFoundError);
    });
  });
});
