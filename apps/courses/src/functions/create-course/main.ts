// import { HttpException, INestApplicationContext } from '@nestjs/common';
// import { NestFactory } from '@nestjs/core';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';

// import {
//   applyDefaults,
//   CoursesModule,
//   CoursesController,
// } from '@curioushuman/co-courses';

/**
 * Hold a reference to your Nest app outside of the bootstrap function
 * to minimize cold starts
 * https://towardsaws.com/serverless-love-story-nestjs-lambda-part-i-minimizing-cold-starts-4ba513e5ce02
 */
// let lambdaApp: INestApplicationContext;

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
// async function bootstrap() {
//   const app = await NestFactory.createApplicationContext(CoursesModule, {
//     bufferLogs: true,
//   });
//   applyDefaults(app);
//   return app;
// }

// async function waitForApp() {
//   if (!lambdaApp) {
//     lambdaApp = await bootstrap();
//   }
//   return lambdaApp;
// }

export const handler = async (
  event: APIGatewayEvent
  // context?: Context
): Promise<APIGatewayProxyResult> => {
  // const app = await waitForApp();
  // const coursesController = app.get(CoursesController);

  // const logger = app.get('logger');
  // logger.debug(`Context: ${JSON.stringify(context, null, 2)}`);

  const response: APIGatewayProxyResult = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: 'Hurrah',
  };

  try {
    // await coursesController.hook(JSON.parse(event.body || '{}'));

    // DO SOMETHING HERE

    return response;
  } catch (error: unknown) {
    // if (error instanceof HttpException) {
    //   response.statusCode = error.getStatus();
    //   response.body = JSON.stringify(error);
    // }
    // logger.error(error);
    return response;
  }
};
