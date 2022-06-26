import { Email } from '../../../shared/domain/value-objects/email';
import { Record, Static } from 'runtypes';

export const User = Record({
  email: Email,
});

export type User = Static<typeof User>;
