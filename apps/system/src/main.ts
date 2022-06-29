import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import { EventsController } from './modules/events/infra/events.controller';
import { EventsModule } from './modules/events/events.module';

/**
 * Hold a reference to your Nest app outside of the bootstrap function
 * to minimize cold starts
 * https://towardsaws.com/serverless-love-story-nestjs-lambda-part-i-minimizing-cold-starts-4ba513e5ce02
 */
let lambdaApp: INestApplicationContext;

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

async function waitForApp() {
  if (!lambdaApp) {
    lambdaApp = await bootstrap();
  }
  return lambdaApp;
}

// export async function handler(event: APIGatewayEvent, context: Context) {
export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const app = await waitForApp();
  const eventsController = app.get(EventsController);

  console.log(`Context: ${JSON.stringify(context, null, 2)}`);

  const transformedEvent = await eventsController.transform(
    JSON.parse(event.body)
  );

  const response: APIGatewayProxyResult = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transformedEvent),
  };

  return response;
};
