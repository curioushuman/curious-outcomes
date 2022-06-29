// import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { APIGatewayEvent } from 'aws-lambda';

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
  return await NestFactory.createApplicationContext(EventsModule);
}

// export async function handler(event: APIGatewayEvent, context: Context) {
export async function handler(event: APIGatewayEvent) {
  const app = await bootstrap();
  const eventsController = app.get(EventsController);
  await eventsController.transform(JSON.parse(event.body));
}
