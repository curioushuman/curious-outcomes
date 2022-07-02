# Data types: Create Participant

## Notes

Assume everything is AND unless specified by OR and ()

## Types

### externalId
- ExternalId type
- Extends string
- **NOTE**: this could do with better validation; drawn from the specific external source
e.g. Salesforce IDs have specific rules

### Participant
- id: UUID
- firstName: extends string
  - Optional
- lastName: extends string
- email: email
- externalId: ExternalId (of participant)
- courseId: related course
- userId: related user

### SavedParticipant

Extends Participant

- RepoIdentifier
  - Dependent on repo

### ParticipantSource

Extends Participant

- Without UUID
- Related Participant Id (from our system)
- External Course Id

### ParticipantSourceHydrated

Extends ParticipantSource

- courseId not optional

### ParticipantSourceForCreate

Extends ParticipantSourceHydrated

- participantId must be empty

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
- SourceInvalidError
  - Extends: BadRequestException
  - Message: Source contains insufficient or invalid data, please review requested record at source
- RepositoryItemConflictError
  - Extends: ConflictException
  - Message: Source already exists within our database. No action required.
- NotificationFailedError
  - Extends: InternalServerException
  - Message: Error sending Notification, contact your system administrator
- EventFailedError
  - Extends: InternalServerException
  - Message: Error emitting event, contact your system administrator

### By Exception extended

- BadRequestException
  - RequestInvalidError
  - SourceInvalidError
- UnauthorizedException
  - RepositoryAuthenticationError
- NotFoundException
  - RepositoryItemNotFoundError
- InternalServerException
  - RepositoryServerError
  - NotificationFailedError
  - EventFailedError
- ConflictException
  - RepositoryItemConflictError

## Events

### ParticipantCreatedEvent

- createdDatetime: dateTime
- course: SavedParticipant

## Notifications

### ParticipantCreatedNotification

- course: SavedParticipant
- subject: Participant created <`SavedParticipant.email`>
- message: Participant <`SavedParticipant.firstName`> <`SavedParticipant.lastName`></br>
| created by <`Admin.name`></br>
| at <`SavedParticipant.createdAt as time`></br>
| on <`SavedParticipant.createdAt as date`>

### Email

- Subject: string, no longer than 80 chars
- Message: string, ideally in a template

### Source repository

- Subject: string, no longer than 80 chars
- Message: string, no longer than 150 chars
