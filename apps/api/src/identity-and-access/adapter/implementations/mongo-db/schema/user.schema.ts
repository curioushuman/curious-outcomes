import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';

import type { User } from '../../../../domain/entities/user';
import { Email } from '../../../../../shared/domain/value-objects/email';

@Schema()
export class MongoDbUser implements User {
  @Prop({ required: true, unique: true, type: String })
  email!: Email;
}

export const MongoDbUserSchema = SchemaFactory.createForClass(MongoDbUser);
export type MongoDbUserDocument = MongoDbUser & Document;

export type MongoDbUserModel = Model<MongoDbUserDocument>;
