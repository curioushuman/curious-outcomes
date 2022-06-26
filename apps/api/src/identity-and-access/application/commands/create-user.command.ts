import { CommandHandler, ICommandHandler, ICommand } from '@nestjs/cqrs';

import type { User } from '../../domain/entities/user';
import { UserRepository } from '../../adapter/ports/user.repository';
import { executeTask } from '../../../shared/utils/execute-task';

export class CreateUserCommand implements ICommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: CreateUserCommand): Promise<void> {
    const { email } = command;
    const user = {
      email,
    } as User;
    await executeTask(this.userRepository.save(user));
    return;
  }
}
