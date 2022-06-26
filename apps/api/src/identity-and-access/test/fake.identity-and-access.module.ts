import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { UsersController } from '../infra/users.controller';
import { CreateUserHandler } from '../application/commands/create-user.command';
import { UserRepository } from '../adapter/ports/user.repository';
import { FakeUserRepository } from '../adapter/implementations/fake/fake.user.repository';

const commandHandlers = [CreateUserHandler];

const repositories = [
  {
    provide: UserRepository,
    useClass: FakeUserRepository,
  },
];

@Module({
  imports: [CqrsModule],
  controllers: [UsersController],
  providers: [...commandHandlers, ...repositories],
  exports: [],
})
export class IdentityAndAccessModule {}
