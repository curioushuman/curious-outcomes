import { HttpException } from '@nestjs/common';
import { APIGatewayProxyResult } from 'aws-lambda';
import { loadFeature, defineFeature } from 'jest-cucumber';

import { handler } from '../main';

/**
 * UNIT TEST
 * - we'll use mocks to unit test everything at local scope
 *
 * TODO
 * - [ ] this needs to be completed
 *
 * Relevant Jest notes (for mocking)
 * https://jestjs.io/docs/es6-class-mocks
 * NOTE: some commented out beginnings at the bottom of the file
 *
 * Scope
 * - validating the request (to the lambda)
 * - finding course
 * - returning response
 * - returning error
 */

const feature = loadFeature('./find-course.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  test('Fail; Invalid request', ({ given, when, then }) => {
    // disabled so we can pass an invalid request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let event: any;
    let error: HttpException;
    let response: APIGatewayProxyResult;

    given('the request is invalid', () => {
      const incomingRequest = {
        whatsThisParameter: 'ThisWontPassMuster',
      };
      event = {
        body: JSON.stringify(incomingRequest),
      };
    });

    when('I attempt to find a course', async () => {
      try {
        response = await handler(event);
        expect(response).toBeUndefined();
      } catch (err: unknown) {
        error = err as HttpException;
      }
    });

    then('I should receive an InternalRequestInvalidError', () => {
      expect(error.getStatus()).toBe(500);
    });
  });

  test('Fail; Empty request', ({ given, when, then }) => {
    // disabled so we can pass an invalid request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let event: any;
    let error: HttpException;
    let response: APIGatewayProxyResult;

    given('the request is empty', () => {
      const incomingRequest = {};
      event = {
        body: JSON.stringify(incomingRequest),
      };
    });

    when('I attempt to find a course', async () => {
      try {
        response = await handler(event);
        expect(response).toBeUndefined();
      } catch (err: unknown) {
        error = err as HttpException;
      }
    });

    then('I should receive an InternalRequestInvalidError', () => {
      expect(error.getStatus()).toBe(500);
    });
  });
});

// Started mocking
// const mockFindOne = jest.fn();
// jest.mock('./sound-player', () => {
//   return jest.fn().mockImplementation(() => {
//     return { findOne: mockFindOne };
//   });
// });

// jest.mock('utils/date', () => ({
//   today: jest.fn(() => '01-01-2020'),
// }));

// const spy = jest.spyOn(browserUtils, 'openBrowser');
// spy.mockImplementation();

// const mockController = {
//   execute: jest.fn(),
// };
