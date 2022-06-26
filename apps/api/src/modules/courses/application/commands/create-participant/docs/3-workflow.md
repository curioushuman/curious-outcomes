# Feature Workflow: Create Participant

## Algorithm

### Input
- ExternalId

### Output

#### Success

- void + success 201
- Participant Created event

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Get external record
3. Hydrate participant
4. Validate participant
5. Save participant
6. Send notifications
7. Emit event
8. Return success

## Steps, detail

### Step 1. Validate input

#### Input
- ExternalId

#### Output: Success

- DTO for findSource

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return findSourceDto
```

### Step 2. Get external record

#### Input
- findSourceDto

#### Output: Success

- ParticipantSource

#### Output: Fail

- RepositoryServerUnavailableError
  - Extends ServiceUnavailableException
- RepositoryAuthenticationError
  - Extends UnauthorizedException
- RepositoryItemNotFoundError
  - Extends NotFoundException
- RepositoryServerError
  - Extends InternalServerException

#### Steps (pseudocode)

```
If Unable to connect
  return RepositoryServerUnavailableError
If Unable to authenticate
  return RepositoryAuthenticationError
If Not found
  return RepositoryItemNotFoundError
If Other
  return RepositoryServerError
Else
  return ParticipantSource
```

### Step 3. Hydrate participant

#### Input
- ParticipantSource

#### Output: Success

- ParticipantSourceHydrated

#### Output: Fail

- SourceInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
Find Course based on externalCourseId
If Course cannot be found for externalCourseId
  return SourceInvalidError
Else
  Add course info to ParticipantSource
return ParticipantSourceHydrated
```

### Step 4. Transform/validate participant

#### Input
- ParticipantSource

#### Output: Success

- Participant

#### Output: Fail

- SourceInvalidError
  - Extends BadRequestException
- RepositoryItemConflictError
  - Extends ConflictException

#### Steps (pseudocode)

```
If Invalid
  return SourceInvalidError
If Already associated
  return SourceInvalidError
If Exists
  return RepositoryItemConflictError
Else
  return Course
```

### Step 5. Save participant

#### Input
- Course

#### Output: Success

- SavedCourse

#### Output: Fail

- RepositoryServerError
  - Extends InternalServerException

#### Steps (pseudocode)

```
Save Course
If Fails
  return RepositoryServerError
Else
  return SavedCourse
```

### Step 6. Send notifications

#### Input
- SavedCourse

#### Output: Success

- void

#### Output: Fail

- NotificationFailedError
  - Extends InternalServerException

#### Steps (pseudocode)

```
Send CourseCreatedNotification
If Fails
  return NotificationFailedError
Else
  return
```

### Step 7. Emit event

#### Input
- SavedCourse

#### Output: Success

- void

#### Output: Fail

- EventFailedError
  - Extends InternalServerException

#### Steps (pseudocode)

```
Emit CourseCreatedEvent
If Fails
  return EventFailedError
Else
  return
```

### Step 8. Return success
