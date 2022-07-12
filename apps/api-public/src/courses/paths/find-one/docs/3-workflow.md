# Feature Workflow: Find Course

## Algorithm

### Input

- Id?
- Slug?

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
- Id?
- Slug?

#### Output: Success

- Id?
- Slug?

#### Output: Fail

- BadRequestException

#### Steps (pseudocode)

```
If Id && Slug not present
  return BadRequestException
Else
  return (same) Id, Slug
```

### Step 2. Transform to FindCourseRequestDto

#### Input
- Id?
- Slug?

#### Output: Success

- FindCourseRequestDto

#### Output: Fail

- None

#### Steps (pseudocode)

```
return FindCourseRequestDto{
  Id?
  Slug?
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
