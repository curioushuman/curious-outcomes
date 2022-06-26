import { Injectable } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';

import { LoggableLogger } from '@curioushuman/loggable';

/**
 * Abstracting away Mongoose settings
 *
 * NOTE
 * - We manually inject logger, as DI is a bit tricky during config
 */

@Injectable()
export class MongoDbConfigService implements MongooseOptionsFactory {
  private logger: LoggableLogger;

  constructor() {
    this.logger = new LoggableLogger(MongoDbConfigService.name);
  }
  createMongooseOptions(): MongooseModuleOptions {
    const u = process.env.MONGODB_USERNAME;
    const p = process.env.MONGODB_PASSWORD;
    const n = process.env.K8S_RELEASE_NAME;
    const ns = process.env.K8S_RELEASE_NAMESPACE;
    const port = process.env.MONGODB_PORT;
    const db = process.env.MONGODB_DATABASE;
    const uri = `mongodb://${u}:${p}@${n}-mongodb.${ns}.svc.cluster.local:${port}/${db}`;
    this.logger.verbose(`MongoDB URI: ${uri}`);
    return {
      uri,
    };
  }
}
