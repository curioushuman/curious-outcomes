import { APIGatewayEvent } from 'aws-lambda';
import { EventBuilder } from '../../src/modules/events/test/builders/event.builder';

/**
 * A builder for Events to play with in testing.
 *
 * NOTES
 * - We include alphas, betas etc to overcome duplicates during testing
 *
 * TODO
 * - [ ] support multiple source repositories concurrently during testing
 *
 * Heavily inspired by: https://github.com/VincentJouanne/nest-clean-architecture
 */

export const AwsEventBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties = {
    httpMethod: 'POST',
    body: EventBuilder().courseSourceCreated().buildRequestDto(),
  };
  const overrides = {
    httpMethod: 'POST',
    body: EventBuilder().courseSourceCreated().buildRequestDto(),
  };

  return {
    courseSourceCreated() {
      return this;
    },

    participantSourceCreated() {
      overrides.body = EventBuilder()
        .participantSourceCreated()
        .buildRequestDto();
      return this;
    },

    unrelatedEvent() {
      overrides.body = EventBuilder().unrelatedEvent().buildRequestDto();
      return this;
    },

    invalid() {
      overrides.body = EventBuilder().invalid().buildRequestDto();
      return this;
    },

    buildApiGatewayEvent(): APIGatewayEvent {
      const event = {
        ...defaultProperties,
        ...overrides,
      };
      event.body = JSON.stringify(event.body);
      return event as APIGatewayEvent;
    },
  };
};
