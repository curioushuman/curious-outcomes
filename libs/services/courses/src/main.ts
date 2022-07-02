import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { Bootstrap } from './bootstrap/bootstrap';
import { AppModule } from './app/app.module';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  Bootstrap.useGlobalSettings(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Listening on port ${port}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
