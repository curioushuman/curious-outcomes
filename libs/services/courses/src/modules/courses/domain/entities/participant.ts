import { Optional, Record, Static } from 'runtypes';

import { Email, ExternalId, PersonName, UserId } from '@curioushuman/co-common';

import { CourseId } from '../value-objects/course-id';
import { ParticipantId } from '../value-objects/participant-id';

export const Participant = Record({
  id: ParticipantId,
  externalId: ExternalId,
  courseId: CourseId,
  userId: UserId,
  firstName: Optional(PersonName),
  lastName: PersonName,
  email: Email,
});

export type Participant = Static<typeof Participant>;
