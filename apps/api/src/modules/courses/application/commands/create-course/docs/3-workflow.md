# Feature Workflow: Create Course

## Algorithm

### Input
- ExternalId

### Output

#### Success

- void + success 201
- Course Created event

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Get external record
3. Validate course
4. Save course
5. Send notifications
6. Emit event
7. Return success

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

- CourseSource

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
  return CourseSource
```

### Step 3. Transform/validate course

#### Input
- CourseSource

#### Output: Success

- Course

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

### Step 4. Save course

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

### Step 5. Send notifications

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

### Step 6. Emit event

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

### Step 7. Return success
