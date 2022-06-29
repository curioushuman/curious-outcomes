import { CreateEventDto } from '../../application/commands/create-event/create-event.dto';
import { CoEvent } from '../../domain/entities/co-event';
import { CreateEventRequestDto } from '../../infra/dto/create-event.request.dto';

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

export const defaultEventId = '1e72ef98-f21e-4e0a-aff1-a45ed7328ae6';
export const defaultObjectId = '06a9572f-5e77-4667-847d-3d9b9ed4520d';

export const EventBuilder = () => {
  /**
   * Default properties don't exist in source repository
   */
  const defaultProperties = {
    id: defaultEventId,
    type: 'Course Source Created',
    payload: {
      id: defaultObjectId,
    },
  };
  const overrides = {
    id: defaultEventId,
    type: 'Course Source Created',
    payload: {
      id: defaultObjectId,
    },
  };

  return {
    courseSourceCreated() {
      return this;
    },

    participantSourceCreated() {
      overrides.type = 'Participant Source Created';
      return this;
    },

    unrelatedEvent() {
      overrides.type = 'Some thing happened';
      return this;
    },

    invalid() {
      delete defaultProperties.type;
      delete overrides.type;
      return this;
    },

    build(): CoEvent {
      return CoEvent.check({
        ...defaultProperties,
        ...overrides,
      });
    },

    buildNoCheck(): CoEvent {
      return {
        ...defaultProperties,
        ...overrides,
      } as CoEvent;
    },

    buildDto(): CreateEventDto {
      return CreateEventDto.check({
        eventId: this.buildNoCheck().id,
        type: this.buildNoCheck().type,
        data: this.buildNoCheck().payload,
      });
    },

    buildRequestDto(): CreateEventRequestDto {
      return {
        eventId: this.buildNoCheck().id,
        type: this.buildNoCheck().type,
        data: this.buildNoCheck().payload,
      } as CreateEventRequestDto;
    },
  };
};
