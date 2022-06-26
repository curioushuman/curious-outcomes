import { INestApplication, ValidationPipe } from '@nestjs/common';

import { LoggableLogger } from '@curioushuman/loggable';

export class Bootstrap {
  public static useGlobalSettings(app: INestApplication) {
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe());
    app.useLogger(new LoggableLogger());
  }
}
