import { Null, Optional, Record, Static } from 'runtypes';

import { ExternalId } from '../value-objects/external-id';
import { PersonName } from '../../../../shared/domain/value-objects/person-name';
import { Email } from '../../../../shared/domain/value-objects/email';
import { ParticipantId } from '../value-objects/participant-id';
import { UserId } from '../../../../shared/domain/value-objects/user-id';
import { CourseId } from '../value-objects/course-id';

/**
 * Notes
 * - userId could be handled in hydration step at some point
 */

/**
 * ---
 * ParticipantSource
 * ---
 * All the things that **could** be returned from the source
 * `OR` populated during hydration.
 *
 * A _Type_ `AND` _runtypes object_, used for runtime type checking / guarding
 */
export const ParticipantSource = Record({
  id: ExternalId,
  participantId: Optional(ParticipantId.Or(Null)),
  externalCourseId: ExternalId,
  courseId: Optional(CourseId.Or(Null)),
  userId: Optional(UserId.Or(Null)),
  firstName: Optional(PersonName),
  lastName: PersonName,
  email: Email,
});

export type ParticipantSource = Static<typeof ParticipantSource>;

/**
 * ---
 */

/**
 * The variations for ParticipantSourceHydrated (below)
 * that need to be defined prior to Type definition
 */
const variationsForHydrated = Record({
  courseId: CourseId,
  userId: UserId,
});

/**
 * ---
 * ParticipantSourceHydrated
 * ---
 * A Specific Type for ParticipantSource once hydration has occurred
 *
 * * Main variation is courseId must **NOT** be empty.
 * * AND userId **NOT** empty.
 *
 * A _Type_ `AND` _runtypes object_, used for runtime type checking / guarding
 */
export const ParticipantSourceHydrated =
  variationsForHydrated.And(ParticipantSource);

export type ParticipantSourceHydrated = Static<
  typeof ParticipantSourceHydrated
>;

/**
 * ---
 */

/**
 * The variations for ParticipantSourceForCreate (below)
 * that need to be defined prior to Type definition
 */
const variationsForCreate = Record({
  courseId: CourseId,
  userId: UserId,
  participantId: Optional(ParticipantId.Or(Null)).withConstraint(
    (participantId) =>
      !participantId ||
      `Source (${participantId}) already associated with a Participant`
  ),
});

/**
 * ---
 * ParticipantSourceForCreate
 * ---
 * A Specific Type for ParticipantSource during Create context.
 *
 * * Main variation is participantId **MUST** be empty.
 * * AND courseId must **NOT** be empty.
 * * AND userId **NOT** empty.
 *
 * A _Type_ `AND` _runtypes object_, used for runtime type checking / guarding
 */
export const ParticipantSourceForCreate =
  variationsForCreate.And(ParticipantSource);

export type ParticipantSourceForCreate = Static<
  typeof ParticipantSourceForCreate
>;
