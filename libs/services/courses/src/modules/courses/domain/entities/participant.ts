import { Optional, Record, Static } from 'runtypes';

import { ExternalId } from '../value-objects/external-id';
import { PersonName } from '../../../../shared/domain/value-objects/person-name';
import { Email } from '../../../../shared/domain/value-objects/email';
import { CourseId } from '../value-objects/course-id';
import { UserId } from '../../../../shared/domain/value-objects/user-id';
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
