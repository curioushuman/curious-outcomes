import { Record, Static } from 'runtypes';

import { ExternalId } from '@curioushuman/co-common';

export const FindCourseSourceDto = Record({
  id: ExternalId,
});

export type FindCourseSourceDto = Static<typeof FindCourseSourceDto>;
