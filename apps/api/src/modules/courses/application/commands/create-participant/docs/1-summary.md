# Feature Summary: Create Participant
## 1. Details
- **Subdomain**: Learning design
- **Aggregate root**: Courses

## 2. Data
### Input data:
- External Id

### Dependencies (from other services/sources)
- SourceRepo.findOne(ById)
  - We need to validate that a source object exists before we save it
  - We might as well grab the data while we're there
- CourseRepo.findOne(ByExternalId)
  - We need to associated our pax with a course record

### Output (results, events, errors)
#### Success (singular result + event)
- Participant created successfully to course (201)
- Event: Participant created

### Failure (1+):

#### Domain

- SourceInvalidError
- RepositoryItemConflictError

#### Other

- RequestInvalidError
- RepositoryAuthenticationError
- RepositoryItemNotFoundError
- RepositoryServerError
- RepositoryServerUnavailableError
- NotificationFailedError
- EventFailedError

## 3. Behaviour

### Triggered by
- Event: External record saved in external system
- Role: Admin only

### Side-effects
- Participant created
- External record updated with participant ID
- Notifications sent
  - Email
  - External system

### Event subscribers

This isn't in Khalil's structure, but I want to record it here as it is part of my thinking.

- ParticipantSource
  - updateParticipantSource

## 4. Decisions

### IMPORTANT

- This command will fail if a participant is not already a user
  - The decision was made to make the creation of a user a separate function
  - AND the logic behind the auto-creation of this user to be more visible within Step functions

### Other

- We only support (creation of participants in) external systems for now
  - In the future we WILL expand for self-registration
- External record info not updatable from custom admin
- NO extra data administer-able from our admin

## 5. Open Questions/actions

- None
