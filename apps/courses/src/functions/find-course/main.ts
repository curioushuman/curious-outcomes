import { APIGatewayProxyResult } from 'aws-lambda';

import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import {
  applyDefaults,
  CoursesModule,
  FindCourseController,
} from '@curioushuman/co-courses';
import { LoggableLogger } from '@curioushuman/loggable';

import { FindCourseApiGatewayRequestEvent } from './dto/api-gateway.request.event';
import { FindCourseRequestDto } from './dto/find-course.request.dto';
import { InternalRequestInvalidError } from '@curioushuman/error-factory';

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
  const logger = new LoggableLogger('FindCourseFunction.handler');
  logger.debug(`Event: ${JSON.stringify(event, null, 2)}`);

  // lambda level validation
  const dto = JSON.parse(event.body || '{}');
  if (!FindCourseRequestDto.guard(dto)) {
    // NOTE: this is a 500 error, not a 400
    const error = new InternalRequestInvalidError(
      'Invalid request sent to FindCourseFunction.Lambda'
    );
    logger.error(error);
    throw error;
  }

  // init the app
  const app = await waitForApp();
  const findCourseController = app.get(FindCourseController);

  // perform the action
  // NOTE: no try/catch here. According to the docs:
  //  _"For async handlers, you can use `return` and `throw` to send a `response`
  //    or `error`, respectively. Functions must use the async keyword to use
  //    these methods to return a `response` or `error`."_
  //    https://docs.aws.amazon.com/lambda/latest/dg/typescript-handler.html
  // Error will be thrown during `executeTask` within the controller.
  // SEE **Error handling and logging** in README for more info.
  const courseResponseDto = await findCourseController.findOne(dto);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(courseResponseDto),
  };
};
