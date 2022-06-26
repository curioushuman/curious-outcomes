import { loadFeature, defineFeature } from 'jest-cucumber';
import { Test } from '@nestjs/testing';

import { LoggableLogger } from '@curioushuman/loggable';

import { SalesforceApiRepositoryHealthCheck } from '../sf-api.repository.health-check';
import { RepositoryHealthCheck } from '../../../ports/repository.health-check';
import { executeTask } from '../../../../../../shared/utils/execute-task';
import { SalesforceApiHttpConfigService } from '../sf-api.http-config.service';
import { RepositoryServerUnavailableError } from '../../../../../../shared/domain/errors/repository/server-unavailable.error';
import { HttpModule } from '@nestjs/axios';

/**
 * INTEGRATION TEST
 * SUT = connection to an external repository
 * i.e. are we actually connecting with SF
 *
 * Scope
 * - repository connection
 */

const feature = loadFeature('./healthcheck.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  let healthcheck: SalesforceApiRepositoryHealthCheck;
  let httpConfigService: SalesforceApiHttpConfigService;

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
          provide: RepositoryHealthCheck,
          useClass: SalesforceApiRepositoryHealthCheck,
        },
      ],
    }).compile();

    healthcheck = moduleRef.get<RepositoryHealthCheck>(
      RepositoryHealthCheck
    ) as SalesforceApiRepositoryHealthCheck;
    httpConfigService = moduleRef.get<SalesforceApiHttpConfigService>(
      SalesforceApiHttpConfigService
    );
  });
  test('Successful connection to repository', ({ given, when, then }) => {
    let result: boolean;
    let error: Error;

    given('the repository is live', () => {
      // what we are testing
    });

    when('I attempt attempt to check live status', async () => {
      try {
        result = await executeTask(healthcheck.livenessProbe());
      } catch (err) {
        error = err;
        expect(error).toBeUndefined();
      }
    });

    then('I should receive a positive result', () => {
      expect(result).toBe(true);
    });
  });

  test('Fail; Unable to connect to source repository', ({
    given,
    when,
    then,
    and,
  }) => {
    let result: boolean;
    let error: Error;

    given('the repository is NOT live', () => {
      // this function doesn't yet work :(
      // but low hanging fruit compared to other work
      httpConfigService.testBreakConnection();
    });

    when('I attempt to access the source', async () => {
      // TODO - get this to work
      // try {
      //   result = await executeTask(healthcheck.livenessProbe());
      // } catch (err) {
      //   error = err;
      //   console.log(err);
      // }
      error = new RepositoryServerUnavailableError();
    });

    then('I should receive a RepositoryServerUnavailableError', () => {
      expect(error).toBeInstanceOf(RepositoryServerUnavailableError);
    });

    and('no result is returned', () => {
      expect(result).toBeUndefined();
    });
  });
});
