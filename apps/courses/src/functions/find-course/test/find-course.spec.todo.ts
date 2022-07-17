// import { loadFeature, defineFeature } from 'jest-cucumber';
// import { APIGatewayEvent } from 'aws-lambda';

// import { FindCourseController } from '@curioushuman/co-courses';

/**
 * UNIT TEST
 * - we'll use mocks to unit test everything at local scope
 *
 * ! NOTE: we're abandoning for the time being
 * Too much other stuff to do
 * The gain for effort is not present
 * I'll have to mock
 * - waitForApp
 * - app & app.get
 * - logger
 * - findCourseController
 *
 * And the handler does so very little
 *
 * * Update: when we come back to this it might be about testing
 * things other than the handler. e.g. we might need to accept
 * input from various AWS services. So we might test the converter.
 *
 * Relevant Jest notes
 * https://jestjs.io/docs/es6-class-mocks
 *
 * Scope
 * - finding course
 * - returning response
 * - returning error
 */

// const feature = loadFeature('./find-course.feature', {
//   loadRelativePath: true,
// });

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
