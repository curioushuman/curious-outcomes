import { APIGatewayProxyResult } from 'aws-lambda';
import { loadFeature, defineFeature } from 'jest-cucumber';
import { FindCourseApiGatewayRequestEvent } from '../dto/api-gateway.request.event';

// import {
//   RepositoryItemNotFoundError,
//   RequestInvalidError,
// } from '@curioushuman/error-factory';

import { handler } from '../main';

/**
 * INTEGRATION TEST
 *
 * NOTE:
 * - we'll just test fail:validation as all we want to know is everything
 *   is communicating and doing as it should. Full coverage, of this sort,
 *   is handled in the tests within lower layers.
 * - when run locally the libs will be loaded by Nx so it's not a true
 *   integration test. But a useful step none the less.
 *
 * Scope
 * - handler and nest play nicely
 */

const feature = loadFeature('./find-course.int.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  test('Fail; Invalid request', ({ given, when, then }) => {
    let event: FindCourseApiGatewayRequestEvent;
    let response: APIGatewayProxyResult;

    given('the request is invalid', () => {
      const incomingRequest = {
        id: 'AnInvalidId',
      };
      event = {
        body: JSON.stringify(incomingRequest),
      };
    });

    when('I attempt to find a course', async () => {
      response = await handler(event);
    });

    then('I should receive a RequestInvalidError', () => {
      expect(response.statusCode).toBe(400);
      console.log(response.body);
    });
  });
});
