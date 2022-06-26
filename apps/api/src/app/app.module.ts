import { Module } from '@nestjs/common';

import { PingModule } from '@curioushuman/ping';
import { LoggableModule } from '@curioushuman/loggable';

import { MongoDbModule } from '../shared/infra/database/mongo-db/mongo-db.module';
import { IdentityAndAccessModule } from '../identity-and-access/identity-and-access.module';
import { CoursesModule } from '../modules/courses/courses.module';

/**
 * Modules = the aggregates of our domain
 */
const modules = [CoursesModule];

/**
 * Supporting imports
 */
const imports = [
  MongoDbModule,
  IdentityAndAccessModule,
  PingModule,
  LoggableModule,
];

@Module({
  imports: [...modules, ...imports],
  controllers: [],
  providers: [],
})
export class AppModule {}
