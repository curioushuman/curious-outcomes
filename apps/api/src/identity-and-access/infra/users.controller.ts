import { Controller, HttpCode, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

// import { UsersQueriesService } from '../application/users-queries.service';
import { CreateUserCommand } from '../application/commands/create-user.command';
// import type { User } from '../domain/entities/user';

/**
 * ! This may not be necessary, after you have implemented the members module
 * Once CreateMember use case exists, and CreateUser can be based on an event
 * For now we're using this for testing purposes
 */

@Controller('users')
export class UsersController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @HttpCode(201)
  async createUser(): Promise<void> {
    return this.commandBus.execute(new CreateUserCommand('what@email.com'));
  }
}
