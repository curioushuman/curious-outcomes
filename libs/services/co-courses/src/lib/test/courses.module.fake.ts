import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableModule } from '@curioushuman/loggable';

import { CourseRepository } from '../adapter/ports/course.repository';
import { FakeCourseRepository } from '../adapter/implementations/fake/fake.course.repository';
import { CourseSourceRepository } from '../adapter/ports/course-source.repository';
import { FakeCourseSourceRepository } from '../adapter/implementations/fake/fake.course-source.repository';
import { FindCourseHandler } from '../application/queries/find-course/find-course.query';
import { FindCourseController } from '../infra/find-course/find-course.controller';
import { CreateCourseController } from '../infra/create-course/create-course.controller';
import { CreateCourseHandler } from '../application/commands/create-course/create-course.command';
// import { ParticipantRepository } from '../adapter/ports/participant.repository';
// import { FakeParticipantRepository } from '../adapter/implementations/fake/fake.participant.repository';
// import { ParticipantSourceRepository } from '../adapter/ports/participant-source.repository';
// import { FakeParticipantSourceRepository } from '../adapter/implementations/fake/fake.participant-source.repository';

const controllers = [CreateCourseController, FindCourseController];

const handlers = [CreateCourseHandler, FindCourseHandler];

const repositories = [
  {
    provide: CourseRepository,
    useClass: FakeCourseRepository,
  },
  {
    provide: CourseSourceRepository,
    useClass: FakeCourseSourceRepository,
  },
  // { provide: ParticipantRepository, useClass: FakeParticipantRepository },
  // {
  //   provide: ParticipantSourceRepository,
  //   useClass: FakeParticipantSourceRepository,
  // },
];

const services = [
  {
    provide: ErrorFactory,
    useClass: FakeRepositoryErrorFactory,
  },
];

@Module({
  imports: [CqrsModule, LoggableModule],
  controllers: [...controllers],
  providers: [...handlers, ...repositories, ...services],
  exports: [],
})
export class CoursesModule {}
