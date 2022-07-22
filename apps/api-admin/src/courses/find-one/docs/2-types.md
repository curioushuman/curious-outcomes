# Data types: Find Course

## Notes

Assume everything is AND unless specified by OR and ()

## Types

- ExternalId, extends String

### FindCourseRequestDto

- ExternalId

### Admin Course response DTO (received)

- id: String
- externalId: string
- name: string
- description: string
- startDate: date
- endDate: date

### Course response DTO (sent)

- (as received)

## Errors

- BadRequestException
  - Message: Invalid request, please review
- NotFoundException
  - Message: A course could not be found, please check source for requested record
- InternalServerException
  - Message: Error finding course, please try again or contact system administrator

## Events

- None

## Notifications

- None
