import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { loadFeature, defineFeature } from 'jest-cucumber';

import { AwsEventBuilder } from './builders/aws-event.builder';
import { handler } from '../src/main';

/**
 * E2E TEST
 * From handler, to relevant response
 *
 * Scope
 * - sending request
 * - receiving response
 */

const feature = loadFeature('./event-transformer.feature', {
  loadRelativePath: true,
});

defineFeature(feature, (test) => {
  test('Successfully transforming external event to event', ({
    given,
    when,
    then,
  }) => {
    let event: APIGatewayEvent;
    let response: APIGatewayProxyResult;

    given('the request is valid', () => {
      event = AwsEventBuilder().courseSourceCreated().buildApiGatewayEvent();
    });

    when('I attempt to transform an event', async () => {
      response = await handler(event, {} as Context);
    });

    then('a matching event should be returned', () => {
      expect(response.statusCode).toBe(200);
    });
  });

  test('Fail; Invalid request', ({ given, when, then }) => {
    let event: APIGatewayEvent;
    let response: APIGatewayProxyResult;

    given('the request contains invalid data', () => {
      event = AwsEventBuilder().invalid().buildApiGatewayEvent();
    });

    when('I attempt to transform an event', async () => {
      response = await handler(event, {} as Context);
    });

    then('I should receive a RequestInvalidError', () => {
      expect(response.statusCode).toBe(400);
    });
  });

  test('Fail; Event not found', ({ given, when, then }) => {
    let event: APIGatewayEvent;
    let response: APIGatewayProxyResult;

    given('the request does not relate to an internal event', () => {
      event = AwsEventBuilder().unrelatedEvent().buildApiGatewayEvent();
    });

    when('I attempt to transform an event', async () => {
      response = await handler(event, {} as Context);
    });

    then('I should receive a EventNotFoundError', () => {
      expect(response.body).toBe(
        'An event by that name could not be found; Some thing happened. Please speak to your system administrator.'
      );
    });
  });
});
