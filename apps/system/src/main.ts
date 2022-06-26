import { NestFactory } from '@nestjs/core';

import { AppController } from './app/app.controller';
import { AppModule } from './app/app.module';

/**
 * Standalone Nest application for Serverless context
 * i.e. we don't load Express, for optimization purposes
 *
 * https://docs.nestjs.com/standalone-applications
 * https://docs.nestjs.com/faq/serverless
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const appController = app.get(AppController);
  console.log(appController.getData());
  await app.close();
}

bootstrap();
