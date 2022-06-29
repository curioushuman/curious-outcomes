import { NotFoundException } from '@nestjs/common';

import {
  ErrorFactory,
  ErrorMessageComponents,
} from '@curioushuman/error-factory';

/**
 * Error message components for this error
 */
const messageComponents: ErrorMessageComponents = {
  base: 'An event by that name could not be found',
  action: 'Please speak to your system administrator',
};

/**
 * Domain error, when a related event is not found
 *
 * Error manifested as exception
 */
export class EventNotFoundError extends NotFoundException {
  constructor(message?: string) {
    super(ErrorFactory.formatMessage(messageComponents, message));
  }
}
