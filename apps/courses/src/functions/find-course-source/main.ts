import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import { HttpException, INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  applyDefaults,
  CoursesModule,
  CoursesController,
} from '@curioushuman/co-courses';
import { LoggableLogger } from '@curioushuman/loggable';

/**
 * Hold a reference to your Nest app outside of the bootstrap function
 * to minimize cold starts
 * https://towardsaws.com/serverless-love-story-nestjs-lambda-part-i-minimizing-cold-starts-4ba513e5ce02
 */
let lambdaApp: INestApplicationContext;

/**
 * Standalone Nest application for Serverless context
 * i.e. we don't load Express, for optimization purposes
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CoursesModule, {
    bufferLogs: true,
  });
  applyDefaults(app);
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
  const coursesController = app.get(CoursesController);

  const logger = new LoggableLogger('handler');
  logger.debug(`Event: ${JSON.stringify(event, null, 2)}`);
  logger.debug(`Context: ${JSON.stringify(context, null, 2)}`);

  const response: APIGatewayProxyResult = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: '',
  };
  try {
    const course = await coursesController.find(JSON.parse(event.body || '{}'));
    response.body = JSON.stringify(course);
    return response;
  } catch (error: unknown) {
    if (error instanceof HttpException) {
      response.statusCode = error.getStatus();
      response.body = JSON.stringify(error);
    }
    logger.error(error);
    return response;
  }
};
