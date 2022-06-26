import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TaskEither, tryCatch } from 'fp-ts/lib/TaskEither';

import { User } from '../../../domain/entities/user';
import { UserRepository } from '../../ports/user.repository';
import { MongoDbUser, MongoDbUserModel } from './schema/user.schema';

@Injectable()
export class MongoDbUserRepository implements UserRepository {
  constructor(
    @InjectModel(MongoDbUser.name) private mongoDbUserModel: MongoDbUserModel
  ) {}

  save = (user: User): TaskEither<Error, void> => {
    return tryCatch(
      async () => {
        const entity = new this.mongoDbUserModel(user);
        await entity.save();
        return;
      },
      (reason: unknown) => new InternalServerErrorException(reason)
    );
  };
}
