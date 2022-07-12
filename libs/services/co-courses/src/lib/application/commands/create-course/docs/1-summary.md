# Feature Summary: Create Course
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

### Output (results, events, errors)
#### Success (singular result + event)
- Course created successfully (201)
- Event: Course created

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
- Course created
- External record updated with course ID
- Notifications sent
  - Email
  - External system

### Event subscribers

This isn't in Khalil's structure, but I want to record it here as it is part of my thinking.

- CourseSource
  - updateCourseSource

## 4. Decisions
- We only support (creation of courses in) external systems for now
  - In the future we might expand to allow them to use our own
- External record info not updatable from custom admin
- NO extra data administer-able from our admin
  - Only aspects such as groups etc

## 5. Open Questions/actions

- Attribution of author
