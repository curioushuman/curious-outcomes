import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';

import { LoggableLogger } from '@curioushuman/loggable';

import { SalesforceApiParticipantSourceRepository } from '../sf-api.participant-source.repository';
import { ParticipantSourceRepository } from '../../../ports/participant-source.repository';
import { executeTask } from '../../../../../../shared/utils/execute-task';
import { ParticipantSource } from '../../../../domain/entities/participant-source';
import { FindParticipantSourceDto } from '../../../../application/queries/find-participant-source/find-participant-source.dto';
import { ParticipantSourceBuilder } from '../../../../test/builders/participant-source.builder';
import { SalesforceApiHttpConfigService } from '../sf-api.http-config.service';
import { ParticipantSourceManufacturer } from './builders/participant-source.manufacturer';

/**
 * INTEGRATION TEST
 * SUT = the findOne function OF an external repository
 * i.e. are we actually connecting with and getting data from SF
 *
 * Scope
 * - repository functions and behaviours
 * - changes to API/data structure
 * - handling of their various responses/errors
 */

const feature = loadFeature('./participant-source.find-one.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let participantSourceManufacturer: ParticipantSourceManufacturer;
  let repository: SalesforceApiParticipantSourceRepository;
  let findParticipantSourceDto: FindParticipantSourceDto;
  let httpService: HttpService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        HttpModule.registerAsync({
          useClass: SalesforceApiHttpConfigService,
        }),
      ],
      providers: [
        LoggableLogger,
        {
          provide: ParticipantSourceRepository,
          useClass: SalesforceApiParticipantSourceRepository,
        },
      ],
    }).compile();

    repository = moduleRef.get<ParticipantSourceRepository>(
      ParticipantSourceRepository
    ) as SalesforceApiParticipantSourceRepository;
    httpService = moduleRef.get<HttpService>(HttpService);

    participantSourceManufacturer = new ParticipantSourceManufacturer(
      httpService,
      'participant-find-one-ext-spec'
    );
  });

  afterAll(async () => {
    await participantSourceManufacturer.tidyUp();
  });

  test('Successfully find one participant source', ({
    given,
    and,
    when,
    then,
  }) => {
    let participantSource: ParticipantSource;
    let result: ParticipantSource;
    let error: Error;

    given('I am authorised to access the source', () => {
      // out of scope
    });

    and('a matching record exists at the source', async () => {
      participantSource = await participantSourceManufacturer.build();
      findParticipantSourceDto = {
        id: participantSource.id,
      };
    });

    when('I request the source by ID', async () => {
      try {
        result = await executeTask(
          repository.findOne(findParticipantSourceDto)
        );
      } catch (err) {
        error = err;
        expect(error).toBeUndefined();
      }
    });

    then('a source corresponding to that ID should be returned', () => {
      expect(result.id).toEqual(participantSource.id);
    });
  });

  test('Fail; Source not found for ID provided', ({
    given,
    and,
    when,
    then,
  }) => {
    let absentParticipantSource: ParticipantSource;
    let result: ParticipantSource;
    let error: Error;

    given('I am authorised to access the source', () => {
      // assumed
    });

    and('a matching record DOES NOT exist at the source', () => {
      absentParticipantSource = ParticipantSourceBuilder()
        .noMatchingSource()
        .build();
      findParticipantSourceDto = {
        id: absentParticipantSource.id,
      };
    });

    when('I request the source by ID', async () => {
      try {
        result = await executeTask(
          repository.findOne(findParticipantSourceDto)
        );
      } catch (err) {
        error = err;
      }
    });

    then('I should receive an Error', () => {
      expect(error).toBeInstanceOf(Error);
    });

    and('no result is returned', () => {
      expect(result).toBeUndefined();
    });
  });
});
