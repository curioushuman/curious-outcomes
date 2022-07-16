# Feature Workflow: Find Course

## Algorithm

### Input

One of:

- FindCourseRequestDto

### Output

#### Success

- Course response DTO

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Determine which identifier we'll use
3. Find course based on identifier
   1. Find course by Id
   2. Find course by externalId, or Slug (in that order)
4. Return
   1. Success and course response DTO
   2. Error

## Steps, detail

### Step 1. Validate input

#### Input
- FindCourseRequestDto

#### Output: Success

- FindCourseRequestDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If empty DTO
  return RequestInvalidError
If Invalid DTO
  return RequestInvalidError
Else
  return (same) FindCourseRequestDto
```

### Step 2. Determine which identifier we'll use

#### Input
- FindCourseRequestDto

#### Output: Success

- Valid CourseId
- OR FindCoursesDto

#### Output: Fail

- None

#### Steps (pseudocode)

```
If FindCourseRequestDto.Id
  return FindCourseRequestDto.Id
If FindCourseRequestDto.ExternalId
  return FindCoursesDto{
    ExternalId: FindCourseRequestDto.ExternalId,
  }
Else
  return FindCoursesDto{
    Slug: FindCourseRequestDto.Slug
  }
```

### Step 3A. Find course by Id

#### Input
- FindCourseRequestDto.Id

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

### Step 3B. Find course by Dto

#### Input
- FindCoursesDto

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
Find Courses by FindCoursesDto
If Unable to connect
  return RepositoryServerUnavailableError
If Unable to authenticate
  return RepositoryAuthenticationError
If Other error
  return RepositoryServerError
If Empty list
  return RepositoryItemNotFoundError
Else
  return Courses[0]
```

### Step 4A. Return success

- Transform Course into Course response DTO
- Return Course response DTO

### Step 4B. Or Error

- Return Error as is
