import { Record, Static } from 'runtypes';

import { ExternalId } from '../../../domain/value-objects/external-id';

export const FindCourseSourceDto = Record({
  id: ExternalId,
});

export type FindCourseSourceDto = Static<typeof FindCourseSourceDto>;
