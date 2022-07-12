import { Record, Static } from 'runtypes';

import { ExternalId } from '@curioushuman/co-common';

/**
 * This is the form of data our repository will expect for the command
 */

export const CreateCourseDto = Record({
  externalId: ExternalId,
});

export type CreateCourseDto = Static<typeof CreateCourseDto>;
