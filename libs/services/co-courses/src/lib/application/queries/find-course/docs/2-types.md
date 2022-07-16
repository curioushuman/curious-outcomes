# Data types: Create Course

## Notes

Assume everything is AND unless specified by OR and ()

## Types

- FindCourseDto
  - Union of
    - FindCourseByIdDto
      - id: CourseId
    - FindCourseByExternalIdDto
      - externalId: ExternalId
    - FindCourseBySlugDto
      - slug: Slug

### Course
- id: UUID
- name: Name extends string
  - Unsure of validation rules
  - Maybe max length
- description: Description extends string
  - Similar RE validation
  - Max length
- startDate: date
  - Has to be in the future
- endDate: date
  - Has to be later than startDate
- externalId: ExternalId

## Errors

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

### By Exception extended

- BadRequestException
  - RequestInvalidError
- UnauthorizedException
  - RepositoryAuthenticationError
- NotFoundException
  - RepositoryItemNotFoundError
- InternalServerException
  - RepositoryServerError

## Events

- None

## Notifications

- None
