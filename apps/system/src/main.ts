import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import { LoggableLogger } from '@curioushuman/loggable';

import { EventsController } from './modules/events/infra/events.controller';
import { EventsModule } from './modules/events/events.module';

/**
 * Hold a reference to your Nest app outside of the bootstrap function
 * to minimize cold starts
 * https://towardsaws.com/serverless-love-story-nestjs-lambda-part-i-minimizing-cold-starts-4ba513e5ce02
 */
let lambdaApp: INestApplicationContext;
let logger: LoggableLogger;

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
  const app = await NestFactory.createApplicationContext(EventsModule, {
    bufferLogs: true,
  });
  logger = new LoggableLogger();
  app.useLogger(logger);
  return app;
}

async function waitForApp() {
  if (!lambdaApp) {
    lambdaApp = await bootstrap();
  }
  return lambdaApp;
}

export const handler = async (
  event: APIGatewayEvent,
  context?: Context
): Promise<APIGatewayProxyResult> => {
  const app = await waitForApp();
  const eventsController = app.get(EventsController);

  logger.debug(`Context: ${JSON.stringify(context, null, 2)}`);

  let response: APIGatewayProxyResult;
  try {
    const transformedEvent = await eventsController.transform(
      JSON.parse(event.body)
    );
    response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedEvent),
    };
    return response;
  } catch (error) {
    response = {
      statusCode: error.status || 500,
      body: JSON.stringify(error),
    };
    logger.error(error);
    return response;
  }
};
