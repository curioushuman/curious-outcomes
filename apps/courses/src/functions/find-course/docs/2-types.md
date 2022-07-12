# Data types: Find Course

## Notes

Assume everything is AND unless specified by OR and ()

## Types

### FindCourseRequestDto

- CourseId?
- ExternalId?
- Slug?

### Course response DTO (received)

- id: String
- externalId: string
- name: string
- description: string
- startDate: date
- endDate: date

### Course response DTO (sent)

- (as received)

## Errors

**NOTE:** we're including the more detailed errors in the response, so that subsequent AWS services/actions can react based on a greater level of detail. These are then filtered to a smaller list at the API level.

- RequestInvalidError
  - Extends: BadRequestException
  - Message: Invalid request, please review
- RepositoryAuthenticationError
  - Extends: UnauthorizedException
  - Message: Error authenticating at repository, please re-authenticate
- RepositoryItemNotFoundError
  - Extends: NotFoundException
  - Message: A source could not be found, please check source for requested record
- RepositoryServerError
  - Extends: InternalServerException
  - Message: Error connecting to repository, please try again or contact system administrator
- RepositoryServerUnavailableError
  - Extends: ServiceUnavailableException
  - Message: The repository is currently unavailable, please try again or contact system administrator

## Events

- None

## Notifications

- None
