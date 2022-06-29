# Feature Summary: Transform external event, to internal event

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

- Event: {Event}

### Failure (1+):

#### Domain specific

- EventNotFoundError

#### Shared

- RequestInvalidError

## 3. Behaviour

### Triggered by

- Event: External event POSTed to the system via webhook
- Role: (External) system events

### Side-effects

- None

## 4. Decisions

- None at this time

## 5. Open Questions/actions

- None at this time
