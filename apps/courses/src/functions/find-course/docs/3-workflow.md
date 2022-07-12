# Feature Workflow: Find Course

## Algorithm

### Input

- FindCourseRequestDto

### Output

#### Success

- Success 200
- Course response DTO

#### Fail

- Errors (see Summary)

### Steps

1. Find course
2. Return
   1. Success
   2. Or Error

## Steps, detail

### Step 1. Find course

#### Input
- FindCourseRequestDto

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
Find Course
If Error
  return Error
Else
  return Course
```

### Step 2A. Return success

### Step 2B. Or error
