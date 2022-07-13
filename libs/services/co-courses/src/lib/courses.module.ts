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
import { FindCourseSourceHandler } from './application/queries/find-course-source/find-course-source.query';
import { FindCourseController } from './infra/find-course/find-course.controller';

/**
 * TODO
 * - [ ] experiment with breaking this file into multiple modules
 *       e.g. find-course.module.ts
 *       This way you can include less files within each lambda
 *       Only worth doing if you're measuring at the same time
 *       And potentially experimenting with various bundling methods
 */

const controllers = [CoursesController, FindCourseController];

const queryHandlers = [FindCourseHandler, FindCourseSourceHandler];

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
  controllers: [...controllers],
  providers: [...queryHandlers, ...repositories, ...services],
  exports: [],
})
export class CoursesModule {}

export const applyDefaults = (app: INestApplicationContext) => {
  app.useLogger(new LoggableLogger());
};
