import { Record, Static } from 'runtypes';

import { ExternalId } from '../../../domain/value-objects/external-id';

export const FindCourseDto = Record({
  externalId: ExternalId,
});

export type FindCourseDto = Static<typeof FindCourseDto>;
