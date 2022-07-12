# Feature Summary: Find Course

## 1. Details

- **Subdomain**: Learning design
- **Aggregate root**: Courses

## 2. Data

### Input data:

- CourseId

### Dependencies (from other services/sources)

- A Repository

### Output (results, events, errors)

#### Success (singular result + event)

- Course

### Failure (1+):

- RequestInvalidError
- RepositoryAuthenticationError
- RepositoryItemNotFoundError
- RepositoryServerError
- RepositoryServerUnavailableError

## 3. Behaviour

### Triggered by

- Controller

### Side-effects

- None

### Event subscribers

- None

## 4. Decisions

- None

## 5. Open Questions/actions

- None
