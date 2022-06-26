import { TaskEither } from 'fp-ts/lib/TaskEither';

import type { User } from '../../domain/entities/user';

export abstract class UserRepository {
  save!: (user: User) => TaskEither<Error, void>;
}
