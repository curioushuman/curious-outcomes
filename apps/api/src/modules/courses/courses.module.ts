import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';

import { LoggableModule } from '@curioushuman/loggable';

import { CoursesController } from './infra/courses.controller';
import { CreateCourseHandler } from './application/commands/create-course/create-course.command';
import { CourseRepository } from './adapter/ports/course.repository';
import { MongoDbCourseRepository } from './adapter/implementations/mongo-db/mongo-db.course.repository';
import {
  MongoDbCourse,
  MongoDbCourseSchema,
} from './adapter/implementations/mongo-db/schema/course.schema';
import { CourseSourceRepository } from './adapter/ports/course-source.repository';
import { ErrorFactory } from '../../shared/domain/errors/error-factory';
import { SalesforceApiCourseSourceRepository } from './adapter/implementations/salesforce-api/sf-api.course-source.repository';
import { SalesforceApiRepositoryErrorFactory } from './adapter/implementations/salesforce-api/sf-api.repository.error-factory';
import { SalesforceApiHttpConfigService } from './adapter/implementations/salesforce-api/sf-api.http-config.service';

const commandHandlers = [CreateCourseHandler];

const repositories = [
  {
    provide: CourseRepository,
    useClass: MongoDbCourseRepository,
  },
  {
    provide: CourseSourceRepository,
    useClass: SalesforceApiCourseSourceRepository,
  },
];

const services = [
  {
    provide: ErrorFactory,
    useClass: SalesforceApiRepositoryErrorFactory,
  },
];

/**
 * Courses module
 *
 * NOTES
 * - Course is the aggregate root of this module
 *  - therefore all *commands* should be routed through it
 */

@Module({
  imports: [
    CqrsModule,
    HttpModule.registerAsync({
      useClass: SalesforceApiHttpConfigService,
    }),
    LoggableModule,
    MongooseModule.forFeature([
      { name: MongoDbCourse.name, schema: MongoDbCourseSchema },
    ]),
  ],
  controllers: [CoursesController],
  providers: [...commandHandlers, ...repositories, ...services],
  exports: [],
})
export class CoursesModule {}
