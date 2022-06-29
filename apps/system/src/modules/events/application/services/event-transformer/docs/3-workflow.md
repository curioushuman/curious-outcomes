# Feature Workflow: Transform external event, to internal event

## Algorithm

### Input
- ExternalEventDto

### Output

- Event

#### Success

- Event, from external event

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Map to internal event
3. Return Event

## Steps, detail

### Step 1. Validate input

#### Input
- ExternalEventDto

#### Output: Success

- ExternalEventDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return ExternalEventDto
```

### Step 2. Map to internal event

#### Input
- ExternalEventDto

#### Output: Success

- Event

#### Output: Fail

- EventNotFoundError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If related event NOT found
  return EventNotFoundError
Else
  return Event
```

### Step 3. Return Event
