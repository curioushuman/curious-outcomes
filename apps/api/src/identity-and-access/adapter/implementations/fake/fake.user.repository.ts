import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

import { User } from '../../../domain/entities/user';
import { UserRepository } from '../../ports/user.repository';

@Injectable()
export class FakeUserRepository implements UserRepository {
  private users: User[] = [];

  save = (user: User): TaskEither<Error, void> => {
    return tryCatch(
      async () => {
        this.users.push(user);
        return;
      },
      (reason: unknown) => new InternalServerErrorException(reason)
    );
  };

  all = (): TaskEither<Error, User[]> => {
    return tryCatch(
      async () => {
        return this.users;
      },
      (reason: unknown) => new InternalServerErrorException(reason)
    );
  };
}
