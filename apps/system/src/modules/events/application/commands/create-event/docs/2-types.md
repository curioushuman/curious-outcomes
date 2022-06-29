# Data types: Create Event, from External Event

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
- EventFailedError
  - Extends: InternalServerException
  - Message: Error emitting event, contact your system administrator

### By Exception extended

- BadRequestException
  - RequestInvalidError
- InternalServerException
  - EventFailedError

## Events

### Event

- createdDatetime: dateTime
- {entity}: {Entity}
