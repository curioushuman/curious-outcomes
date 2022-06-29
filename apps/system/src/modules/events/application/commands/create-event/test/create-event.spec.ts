import { NotFoundException } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test, TestingModule } from '@nestjs/testing';

import { LoggableLogger } from '@curioushuman/loggable';

import {
  CreateEventCommand,
  CreateEventHandler,
} from '../create-event.command';
import { EventRepository } from '../../../../adapter/ports/event.repository';
import { FakeEventRepository } from '../../../../adapter/implementations/fake/fake.Event.repository';
import { EventSourceRepository } from '../../../../adapter/ports/event-source.repository';
import { FakeEventSourceRepository } from '../../../../adapter/implementations/fake/fake.Event-source.repository';
import { executeTask } from '../../../../../../shared/utils/execute-task';
import { CreateEventRequestDto } from '../../../../infra/dto/create-event.request.dto';
import { Event } from '../../../../domain/entities/co-event';
import { SourceInvalidError } from '../../../../../../shared/domain/errors/repository/source-invalid.error';
import { RepositoryItemConflictError } from '../../../../../../shared/domain/errors/repository/item-conflict.error';
import { ErrorFactory } from '../../../../../../shared/domain/errors/error-factory';
import { FakeRepositoryErrorFactory } from '../../../../../../shared/adapter/fake.repository.error-factory';
import { EventBuilder } from '../../../../test/builders/event.builder';

/**
 * UNIT TEST
 * SUT = the command & command handler
 *
 * Out of scope
 * - request validation
 * - repository authorisation
 * - repository access issues
 */

const feature = loadFeature('./create-event.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let repository: FakeEventRepository;
  let handler: CreateEventHandler;
  let createEventDto: CreateEventRequestDto;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateEventHandler,
        LoggableLogger,
        { provide: EventRepository, useClass: FakeEventRepository },
        {
          provide: EventSourceRepository,
          useClass: FakeEventSourceRepository,
        },
        {
          provide: ErrorFactory,
          useClass: FakeRepositoryErrorFactory,
        },
      ],
    }).compile();

    repository = moduleRef.get<EventRepository>(
      EventRepository
    ) as FakeEventRepository;
    handler = moduleRef.get<CreateEventHandler>(CreateEventHandler);
  });

  test('Successfully creating a Event', ({ given, and, when, then }) => {
    let Events: Event[];
    let EventsBefore: number;
    // disabling no-explicit-any for testing purposes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;

    given('a matching record is found at the source', () => {
      // we know this to exist in our fake repo
      createEventDto = EventBuilder().beta().buildDto();
    });

    and('the returned source populates a valid Event', () => {
      // we know this to be true
      // out of scope for this test
    });

    and('the source does not already exist in our DB', async () => {
      Events = await executeTask(repository.all());
      EventsBefore = Events.length;
    });

    when('I attempt to create a Event', async () => {
      result = await handler.execute(new CreateEventCommand(createEventDto));
    });

    then('a new record should have been created', async () => {
      Events = await executeTask(repository.all());
      expect(Events.length).toEqual(EventsBefore + 1);
    });

    and('no result is returned', () => {
      expect(result).toEqual(undefined);
    });
  });

  test('Fail; Source not found for ID provided', ({ given, when, then }) => {
    let error: Error;

    given('no record exists that matches our request', () => {
      createEventDto = EventBuilder().noMatchingSource().buildDto();
    });

    when('I attempt to create a Event', async () => {
      try {
        await handler.execute(new CreateEventCommand(createEventDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a RepositoryItemNotFoundError', () => {
      expect(error).toBeInstanceOf(NotFoundException);
    });
  });

  test('Fail; Source does not translate into a valid Event', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      createEventDto = EventBuilder().invalidSource().buildDto();
    });

    and('the returned source does not populate a valid Event', () => {
      // this occurs during
    });

    when('I attempt to create a Event', async () => {
      try {
        await handler.execute(new CreateEventCommand(createEventDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });

  test('Fail; Source already exists in our DB', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      // confirmed
    });

    and('the returned source populates a valid Event', () => {
      // known
    });

    and('the source DOES already exist in our DB', () => {
      createEventDto = EventBuilder().exists().buildDto();
    });

    when('I attempt to create a Event', async () => {
      try {
        await handler.execute(new CreateEventCommand(createEventDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive an RepositoryItemConflictError', () => {
      expect(error).toBeInstanceOf(RepositoryItemConflictError);
    });
  });

  test('Fail; Source is already associated with a Event', ({
    given,
    and,
    when,
    then,
  }) => {
    let error: Error;

    given('a matching record is found at the source', () => {
      // we know this
    });

    and('the returned source is already associated with a Event', () => {
      createEventDto = EventBuilder().withEvent().buildDto();
    });

    when('I attempt to create a Event', async () => {
      try {
        await handler.execute(new CreateEventCommand(createEventDto));
      } catch (err) {
        error = err;
      }
    });

    then('I should receive a SourceInvalidError', () => {
      expect(error).toBeInstanceOf(SourceInvalidError);
    });
  });
});
