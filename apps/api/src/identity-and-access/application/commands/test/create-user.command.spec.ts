import { Test, TestingModule } from '@nestjs/testing';

import { CreateUserCommand, CreateUserHandler } from '../create-user.command';
import { UserRepository } from '../../../adapter/ports/user.repository';
import { FakeUserRepository } from '../../../adapter/implementations/fake/fake.user.repository';
import { executeTask } from '../../../../shared/utils/execute-task';

let repository: FakeUserRepository;

describe('[Unit] Create User Command', () => {
  let handler: CreateUserHandler;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserHandler,
        { provide: UserRepository, useClass: FakeUserRepository },
      ],
    }).compile();

    repository = moduleRef.get<UserRepository>(
      UserRepository
    ) as FakeUserRepository;
    handler = moduleRef.get<CreateUserHandler>(CreateUserHandler);
  });

  describe('When ALL input is valid', () => {
    test('then it should add a user', async () => {
      const result = await handler.execute(
        new CreateUserCommand('test@email.com')
      );
      const users = await executeTask(repository.all());

      expect(result).toEqual(undefined);
      expect(users.length).toEqual(1);
    });
  });
});
