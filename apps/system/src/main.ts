import { NestFactory } from '@nestjs/core';

import { EventsController } from './modules/events/infra/events.controller';
import { EventsModule } from './modules/events/events.module';

/**
 * Standalone Nest application for Serverless context
 * i.e. we don't load Express, for optimization purposes
 *
 * This is possible here, because we are not integrating
 * with any 3rd party anything. No DB, no Redis, no etc.
 *
 * https://docs.nestjs.com/standalone-applications
 * https://docs.nestjs.com/faq/serverless
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(EventsModule);

  const eventsController = app.get(EventsController);

  await eventsController.create();

  await app.close();
}

bootstrap();
