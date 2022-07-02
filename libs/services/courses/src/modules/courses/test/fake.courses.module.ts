import { Module } from '@nestjs/common';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableModule } from '@curioushuman/loggable';

import { FindCourseController } from '../infra/find-course.controller';
import { CourseRepository } from '../adapter/ports/course.repository';
import { FakeCourseRepository } from '../adapter/implementations/fake/fake.course.repository';
import { CourseSourceRepository } from '../adapter/ports/course-source.repository';
import { FakeCourseSourceRepository } from '../adapter/implementations/fake/fake.course-source.repository';
// import { ParticipantRepository } from '../adapter/ports/participant.repository';
// import { FakeParticipantRepository } from '../adapter/implementations/fake/fake.participant.repository';
// import { ParticipantSourceRepository } from '../adapter/ports/participant-source.repository';
// import { FakeParticipantSourceRepository } from '../adapter/implementations/fake/fake.participant-source.repository';

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
  imports: [LoggableModule],
  controllers: [FindCourseController],
  providers: [...repositories, ...services],
  exports: [],
})
export class CoursesModule {}
