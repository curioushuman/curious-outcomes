# Feature Summary: Find Course

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Courses

## 2. Data

### Input data:

- FindCourseRequestDto

### Dependencies (from other services/sources)

- None

### Output (results, events, errors)

#### Success (singular result + event)

- Course found successfully (200)
- Course response DTO

### Failure (1+):

- RequestInvalidError
- RepositoryAuthenticationError
- RepositoryItemNotFoundError
- RepositoryServerError
- RepositoryServerUnavailableError

## 3. Behaviour

### Triggered by

- FindCourseFunction/Lambda

### Side-effects

- None

### Event subscribers

- None

## 4. Decisions

- None

## 5. Open Questions/actions

- None
