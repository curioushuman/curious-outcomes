# Feature Workflow: Find Course

## Algorithm

### Input

- CourseId

### Output

#### Success

- Course

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Find course
3. Return
   1. Success and course
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input
- CourseId

#### Output: Success

- CourseId

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid CourseId
  return RequestInvalidError
Else
  return (same) CourseId
```

### Step 2. Find course

#### Input
- CourseId

#### Output: Success

- Course

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
Find Course by Id
If Unable to connect
  return RepositoryServerUnavailableError
If Unable to authenticate
  return RepositoryAuthenticationError
If Not found
  return RepositoryItemNotFoundError
If Other
  return RepositoryServerError
Else
  return Course
```

### Step 3A. Return success

- Return Course as is

### Step 3B. Or Error

- Return Error as is
