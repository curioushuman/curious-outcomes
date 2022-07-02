import { Record, Static } from 'runtypes';

import { ExternalId } from '@curioushuman/co-common';

export const FindCourseDto = Record({
  externalId: ExternalId,
});

export type FindCourseDto = Static<typeof FindCourseDto>;
