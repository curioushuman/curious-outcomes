import { APIGatewayProxyResult } from 'aws-lambda';

import { HttpException, INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  applyDefaults,
  CoursesModule,
  FindCourseController,
} from '@curioushuman/co-courses';
import { LoggableLogger } from '@curioushuman/loggable';
import { FindCourseApiGatewayRequestEvent } from './dto/api-gateway.request.event';

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

/**
 * The official handler for the Lambda function
 *
 * All it does is forward the request on to the Nest application
 * and return the response.
 *
 * NOTES:
 * - we use our own (trimmed down) version of the incoming request event
 * - if we ever need to expand to accept events from other AWS services
 *   use a union of custom events (like this one)
 * - we're going to exclude context for now as we don't yet need it
 *   i.e. the second argument for handler
 */
export const handler = async (
  event: FindCourseApiGatewayRequestEvent
): Promise<APIGatewayProxyResult> => {
  const app = await waitForApp();
  const findCourseController = app.get(FindCourseController);

  const logger = new LoggableLogger('handler');
  logger.debug(`Event: ${JSON.stringify(event, null, 2)}`);

  const response: APIGatewayProxyResult = {
    statusCode: 500,
    headers: {
      'Content-Type': 'application/json',
    },
    body: '',
  };
  try {
    const courseResponseDto = await findCourseController.findOne(
      JSON.parse(event.body || '{}')
    );
    response.statusCode = 200;
    response.body = JSON.stringify(courseResponseDto);
    return response;
  } catch (error: unknown) {
    if (error instanceof HttpException) {
      response.statusCode = error.getStatus();
      response.body = JSON.stringify(error);
    }
    /**
     * We'll only log it as an error if it's a server error
     * i.e. something we should pay attention to
     */
    response.statusCode === 500 ? logger.error(error) : logger.log(error);
    return response;
  }
};
