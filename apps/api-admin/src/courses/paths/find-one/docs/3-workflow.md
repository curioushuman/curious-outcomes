# Feature Workflow: Find Course

## Algorithm

### Input

- ExternalId

### Output

#### Success

- Success 200
- Course response DTO

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Transform to FindCourseRequestDto
3. Find course
4. Return
   1. Success and course
   2. OR Transform/filter errors to acceptable list

## Steps, detail

### Step 1. Validate input

#### Input
- ExternalId

#### Output: Success

- ExternalId

#### Output: Fail

- BadRequestException

#### Steps (pseudocode)

```
If ExternalId not present
  return BadRequestException
Else
  return (same) ExternalId
```

### Step 2. Transform to FindCourseRequestDto

#### Input
- ExternalId

#### Output: Success

- FindCourseRequestDto

#### Output: Fail

- None

#### Steps (pseudocode)

```
return FindCourseRequestDto{
  ExternalId
}
```

### Step 3. Find course

#### Input
- FindCourseRequestDto

#### Output: Success

- Course

#### Output: Fail

- NotFoundException
- InternalServerException

#### Steps (pseudocode)

```
Find Course
If Error
  return InternalServerException
If not found
  return NotFoundException
Else
  return Course
```

### Step 4A. Return success

### Step 4B. OR Transform/filter errors to acceptable list
