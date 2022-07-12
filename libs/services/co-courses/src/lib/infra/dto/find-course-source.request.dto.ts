import { Record, Static } from 'runtypes';

import { ExternalId } from '@curioushuman/co-common';

/**
 * This is the form of data we expect as input into our API/Request
 */

export const FindCourseSourceRequestDto = Record({
  id: ExternalId,
});

export type FindCourseSourceRequestDto = Static<
  typeof FindCourseSourceRequestDto
>;
