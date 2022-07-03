import { INestApplicationContext, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  ErrorFactory,
  FakeRepositoryErrorFactory,
} from '@curioushuman/error-factory';
import { LoggableLogger, LoggableModule } from '@curioushuman/loggable';

import { CoursesController } from './infra/courses.controller';
import { CourseRepository } from './adapter/ports/course.repository';
import { FakeCourseRepository } from './adapter/implementations/fake/fake.course.repository';
import { FindCourseHandler } from './application/queries/find-course/find-course.query';

const queryHandlers = [FindCourseHandler];

const repositories = [
  {
    provide: CourseRepository,
    useClass: FakeCourseRepository,
  },
];

const services = [
  {
    provide: ErrorFactory,
    useClass: FakeRepositoryErrorFactory,
  },
];

@Module({
  imports: [CqrsModule, LoggableModule],
  controllers: [CoursesController],
  providers: [...queryHandlers, ...repositories, ...services],
  exports: [],
})
export class CoursesModule {}

export const bootstrap = (app: INestApplicationContext) => {
  app.useLogger(new LoggableLogger());
};
