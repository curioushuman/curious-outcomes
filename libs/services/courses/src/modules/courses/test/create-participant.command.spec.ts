import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { loadFeature, defineFeature } from 'jest-cucumber';

import { Bootstrap } from '../../../bootstrap/bootstrap';
import { CoursesModule } from './fake.courses.module';
import { CreateParticipantRequestDto } from '../infra/dto/create-participant.request.dto';
import { FakeParticipantRepository } from '../adapter/implementations/fake/fake.participant.repository';
import { ParticipantRepository } from '../adapter/ports/participant.repository';
import { Participant } from '../domain/entities/participant';
import { executeTask } from '../../../shared/utils/execute-task';
import { ParticipantBuilder } from './builders/participant.builder';

/**
 * INTEGRATION TEST
 * Making sure all our bits work together
 * Without worrying about third parties
 *
 * Scope
 * - sending request
 * - receiving response
 */

const feature = loadFeature('./create-participant.command.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let app: INestApplication;
  let repository: FakeParticipantRepository;
  let createParticipantRequestDto: CreateParticipantRequestDto;
  // disabling no-explicit-any for testing purposes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let httpServer: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [CoursesModule],
    }).compile();

    app = moduleRef.createNestApplication();
    Bootstrap.useGlobalSettings(app);
    await app.init();
    httpServer = app.getHttpServer();
    repository = moduleRef.get<ParticipantRepository>(
      ParticipantRepository
    ) as FakeParticipantRepository;
  });

  afterAll(async () => {
    await app.close();
  });

  test('Successfully creating a participant', ({ given, and, when, then }) => {
    let response: request.Response;
    let participants: Participant[];
    let participantsBefore: number;

    beforeAll(async () => {
      participants = await executeTask(repository.all());
      participantsBefore = participants.length;
    });

    given('the request is valid', () => {
      createParticipantRequestDto = ParticipantBuilder()
        .beta()
        .buildRequestDto();
    });

    and('a matching record is found at the source', () => {
      // handled in previous
    });

    when('I attempt to create a participant', async () => {
      response = await request(httpServer)
        .post(`/api/courses/participants`)
        .send(createParticipantRequestDto);
    });

    then('a new record should have been created', async () => {
      participants = await executeTask(repository.all());
      expect(participants.length).toEqual(participantsBefore + 1);
    });

    and('a positive response received', () => {
      expect(response.status).toBe(201);
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let response: request.Response;

    given('the request contains invalid data', () => {
      createParticipantRequestDto = ParticipantBuilder()
        .invalid()
        .buildRequestDto();
    });

    when('I attempt to create a participant', async () => {
      response = await request(httpServer)
        .post(`/api/courses/participants`)
        .send(createParticipantRequestDto);
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

    given('the request is valid', () => {
      // true
    });

    and('no record exists that matches our request', () => {
      createParticipantRequestDto = ParticipantBuilder()
        .noMatchingSource()
        .buildRequestDto();
    });

    when('I attempt to create a participant', async () => {
      response = await request(httpServer)
        .post(`/api/courses/participants`)
        .send(createParticipantRequestDto);
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

    given('the request is valid', () => {
      // true
    });

    and('a matching record is found at the source', () => {
      // true
    });

    and('the returned source populates a valid participant', () => {
      // true
    });

    and('the source DOES already exist in our DB', () => {
      createParticipantRequestDto = ParticipantBuilder()
        .exists()
        .buildRequestDto();
    });

    when('I attempt to create a participant', async () => {
      response = await request(httpServer)
        .post(`/api/courses/participants`)
        .send(createParticipantRequestDto);
    });

    then(
      'I should receive an RepositoryItemConflictError/ConflictException',
      () => {
        expect(response.status).toBe(409);
      }
    );
  });
});
