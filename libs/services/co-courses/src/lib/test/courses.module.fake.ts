import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableModule } from '@curioushuman/loggable';

import { CoursesController } from '../infra/courses.controller';
import { CourseRepository } from '../adapter/ports/course.repository';
import { FakeCourseRepository } from '../adapter/implementations/fake/fake.course.repository';
// import { CourseSourceRepository } from '../adapter/ports/course-source.repository';
// import { FakeCourseSourceRepository } from '../adapter/implementations/fake/fake.course-source.repository';
import { FindCourseHandler } from '../application/queries/find-course/find-course.query';
import { FindCourseController } from '../infra/find-course/find-course.controller';
// import { ParticipantRepository } from '../adapter/ports/participant.repository';
// import { FakeParticipantRepository } from '../adapter/implementations/fake/fake.participant.repository';
// import { ParticipantSourceRepository } from '../adapter/ports/participant-source.repository';
// import { FakeParticipantSourceRepository } from '../adapter/implementations/fake/fake.participant-source.repository';

const controllers = [CoursesController, FindCourseController];

const queryHandlers = [FindCourseHandler];

const repositories = [
  {
    provide: CourseRepository,
    useClass: FakeCourseRepository,
  },
  // {
  //   provide: CourseSourceRepository,
  //   useClass: FakeCourseSourceRepository,
  // },
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
  providers: [...queryHandlers, ...repositories, ...services],
  exports: [],
})
export class CoursesModule {}
