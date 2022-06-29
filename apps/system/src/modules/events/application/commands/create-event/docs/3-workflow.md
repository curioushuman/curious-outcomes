# Feature Workflow: Create Event, from External Event

## Algorithm

### Input
- ExternalEventDto

### Output

- Event

#### Success

- void + success 200
- Event, from external event

#### Fail

- Errors (see Summary)

### Steps

1. Validate input
2. Map to internal event
3. Emit event
4. Return success

## Steps, detail

### Step 1. Validate input

#### Input
- ExternalEventDto

#### Output: Success

- EventDto

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Invalid
  return RequestInvalidError
Else
  return EventDto
```

### Step 2. Map to internal event

#### Input
- EventDto

#### Output: Success

- Event

#### Output: Fail

- RequestInvalidError
  - Extends BadRequestException

#### Steps (pseudocode)

```
If Internal related event NOT found
  return RequestInvalidError
Else
  return Event
```

### Step 3. Emit event

#### Input
- Event

#### Output: Success

- void

#### Output: Fail

- EventFailedError
  - Extends InternalServerException

#### Steps (pseudocode)

```
Emit Event
If Fails
  return EventFailedError
Else
  return
```

### Step 4. Return success
