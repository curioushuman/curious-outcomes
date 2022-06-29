# Feature Summary: Create Event, from External Event

## 1. Details

- **Subdomain**: System
- **Aggregate root**: Events

## 2. Data

### Input data:

- ExternalEventDto

### Dependencies (from other services/sources)

- None

### Output (results, events, errors)

#### Success (singular result + event)

- Event emitted (200)
- Event: {Event}

### Failure (1+):

#### Domain specific

- None

#### Shared

- RequestInvalidError
- EventFailedError

## 3. Behaviour

### Triggered by

- Event: External event POSTed to the system via webhook
- Role: (External) system events

### Side-effects

- Event emitted

## 4. Decisions

- None at this time

## 5. Open Questions/actions

- None at this time
