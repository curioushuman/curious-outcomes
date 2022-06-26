import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersController } from './infra/users.controller';
import { CreateUserHandler } from './application/commands/create-user.command';
import { UserRepository } from './adapter/ports/user.repository';
import { MongoDbUserRepository } from './adapter/implementations/mongo-db/mongo-db.user.repository';
import {
  MongoDbUser,
  MongoDbUserSchema,
} from './adapter/implementations/mongo-db/schema/user.schema';

const commandHandlers = [CreateUserHandler];

const repositories = [
  {
    provide: UserRepository,
    useClass: MongoDbUserRepository,
  },
];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: MongoDbUser.name, schema: MongoDbUserSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [...commandHandlers, ...repositories],
  exports: [],
})
export class IdentityAndAccessModule {}
