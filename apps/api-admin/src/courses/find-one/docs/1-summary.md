# Feature Summary: Find Course

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Courses

## 2. Data

### Input data:

- External Id, extends string

### Dependencies (from other services/sources)

- FindCourseFunction/Lambda

### Output (results, events, errors)

#### Success (singular result + event)

- Course found successfully (200)
- Course response DTO

### Failure (1+):

- BadRequestException
- NotFoundException
- InternalServerException

## 3. Behaviour

### Triggered by

- API: Hitting API endpoint
- Role: Admin only

### Side-effects

- None

### Event subscribers

- None

## 4. Decisions

- None

## 5. Open Questions/actions

- None
