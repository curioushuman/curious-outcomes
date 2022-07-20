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

NOTE: validation step removed as API gateway isn't able to handle anything other then required params.

1. Transform to FindCourseRequestDto
2. Find Course
3. Return
   1. Success and PublicCourseResponseDto
   2. OR Transform/filter errors to acceptable list

## Steps, detail

### Step 1. Transform to FindCourseRequestDto

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

### Step 2. Find course

#### Input
- FindCourseRequestDto

#### Output: Success

- CourseResponseDto

#### Output: Fail

- NotFoundException
- InternalServerException

#### Steps (pseudocode)

```
Find Course
If Error
  return Transform Error
Else
  return Transform Course Response
```

### Step 3A. Return success

### Step 3B. OR Transform/filter errors to acceptable list
