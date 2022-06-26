import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MongoDbService } from './mongo-db.service';
import { MongoDbConfigService } from './mongo-db.config.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongoDbConfigService,
    }),
  ],
  providers: [MongoDbService],
  exports: [MongoDbService],
})
export class MongoDbModule {}
