# Feature Workflow: Find Courses

## Algorithm

### Input

- FindCoursesDto

### Output

#### Success

- Course[]

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Find courses
3. Return
   1. Courses
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input
- FindCoursesDto

#### Output: Success

- FindCoursesDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid FindCoursesDto
  return RequestInvalidError
Else
  return (same) FindCoursesDto
```

### Step 2. Find courses

#### Input
- FindCoursesDto

#### Output: Success

- Courses

#### Output: Fail

- RepositoryServerUnavailableError
  - Extends ServiceUnavailableException
- RepositoryAuthenticationError
  - Extends UnauthorizedException
- RepositoryServerError
  - Extends InternalServerException

#### Steps (pseudocode)

```
Find Courses
If Unable to connect
  return RepositoryServerUnavailableError
If Unable to authenticate
  return RepositoryAuthenticationError
If Other error
  return RepositoryServerError
Else
  return Course[]
```

### Step 3A. Return success

- Return Courses[]

### Step 3B. Or Error

- Return Error as is
