import { Literal, Static, Union } from 'runtypes';

/**
 * Defines which events are allowed by the system
 */

export const EventType = Union(
  Literal('Course Source Created'),
  Literal('Participant Source Created')
);

export type EventType = Static<typeof EventType>;
