import { HttpException } from '@nestjs/common';
import { loadFeature, defineFeature } from 'jest-cucumber';

import { handler } from '../main';
import { CourseResponseDto } from '../../../dto/course.response.dto';
import { FindCourseRequestDto } from '../dto/request.dto';

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
    let error: HttpException;
    let dto: FindCourseRequestDto;
    let response: CourseResponseDto;

    given('the request is invalid', () => {
      dto = {
        id: 'AnInvalidId',
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

    then('I should receive a RequestInvalidError', () => {
      expect(error.getStatus()).toBe(400);
      expect(error.message).toEqual(expect.stringMatching(/^Invalid request/i));
    });
  });
});
