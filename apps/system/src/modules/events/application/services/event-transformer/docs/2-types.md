# Data types: Transform external event, to internal event

## Notes

Assume everything is AND unless specified by OR and ()

## Types

### ExternalEventDto
- Id
- Summary
- Data

### Event
- Id
- Summary
- Payload

## Errors

- RequestInvalidError
  - Extends: BadRequestException
  - Message: Invalid request, please review
- EventNotFoundError
  - Extends: BadRequestException
  - Message: Event not found, please review

### By Exception extended

- BadRequestException
  - RequestInvalidError
  - EventNotFoundError

## Events

### Event

- None
