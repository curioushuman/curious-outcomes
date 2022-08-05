import { HttpException } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';

import { handler } from '../main';
import { CourseResponseDto } from '../../../dto/course.response.dto';

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
    let dto: any;
    let error: HttpException;
    let response: CourseResponseDto;

    given('the request is invalid', () => {
      dto = {
        whatsThisParameter: 'ThisWontPassMuster',
      };
    });

    when('I attempt to find a course', async () => {
      try {
        response = await handler(dto);
        expect(response).toBeUndefined();
      } catch (err: unknown) {
        error = err as HttpException;
      }
    });

    then('I should receive an InternalRequestInvalidError', () => {
      expect(error.getStatus()).toBe(500);
      // this should match the regex you use in your API method integration response
      expect(error.message).toEqual(
        expect.stringMatching(/^Invalid internal communication/i)
      );
    });
  });

  test('Fail; Empty request', ({ given, when, then }) => {
    // disabled so we can pass an invalid request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dto: any;
    let error: HttpException;
    let response: CourseResponseDto;

    given('the request is empty', () => {
      dto = {};
    });

    when('I attempt to find a course', async () => {
      try {
        response = await handler(dto);
        expect(response).toBeUndefined();
      } catch (err: unknown) {
        error = err as HttpException;
      }
    });

    then('I should receive an InternalRequestInvalidError', () => {
      // this should match the regex you use in your API method integration response
      expect(error.message).toEqual(
        expect.stringMatching(/^Invalid internal communication/i)
      );
    });
  });

  test('Fail; Empty values request', ({ given, when, then }) => {
    // disabled so we can pass an invalid request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dto: any;
    let error: HttpException;
    let response: CourseResponseDto;

    given('the request contains empty values', () => {
      dto = {
        id: '',
      };
    });

    when('I attempt to find a course', async () => {
      try {
        response = await handler(dto);
        expect(response).toBeUndefined();
      } catch (err: unknown) {
        error = err as HttpException;
      }
    });

    then('I should receive an InternalRequestInvalidError', () => {
      // this should match the regex you use in your API method integration response
      expect(error.message).toEqual(
        expect.stringMatching(/^Invalid internal communication/i)
      );
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
