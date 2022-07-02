import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';

import { LoggableModule } from '@curioushuman/loggable';

import { CoursesController } from '../infra/courses.controller';
import { CreateCourseHandler } from '../application/commands/create-course/create-course.command';
import { CourseRepository } from '../adapter/ports/course.repository';
import { FakeCourseRepository } from '../adapter/implementations/fake/fake.course.repository';
import { CourseSourceRepository } from '../adapter/ports/course-source.repository';
import { FakeCourseSourceRepository } from '../adapter/implementations/fake/fake.course-source.repository';
import { ErrorFactory } from '../../../shared/domain/errors/error-factory';
import { FakeRepositoryErrorFactory } from '../../../shared/adapter/fake.repository.error-factory';
import { ParticipantRepository } from '../adapter/ports/participant.repository';
import { FakeParticipantRepository } from '../adapter/implementations/fake/fake.participant.repository';
import { ParticipantSourceRepository } from '../adapter/ports/participant-source.repository';
import { FakeParticipantSourceRepository } from '../adapter/implementations/fake/fake.participant-source.repository';
import { CreateParticipantHandler } from '../application/commands/create-participant/create-participant.command';
import { ParticipantSourceHydrationService } from '../application/services/participant-source-hydration.service';

const commandHandlers = [CreateCourseHandler, CreateParticipantHandler];

const repositories = [
  {
    provide: CourseRepository,
    useClass: FakeCourseRepository,
  },
  {
    provide: CourseSourceRepository,
    useClass: FakeCourseSourceRepository,
  },
  { provide: ParticipantRepository, useClass: FakeParticipantRepository },
  {
    provide: ParticipantSourceRepository,
    useClass: FakeParticipantSourceRepository,
  },
];

const services = [
  {
    provide: ErrorFactory,
    useClass: FakeRepositoryErrorFactory,
  },
  ParticipantSourceHydrationService,
];

@Module({
  imports: [CqrsModule, HttpModule, LoggableModule],
  controllers: [CoursesController],
  providers: [...commandHandlers, ...repositories, ...services],
  exports: [],
})
export class CoursesModule {}
