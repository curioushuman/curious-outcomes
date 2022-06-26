import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { Connection } from 'mongoose';

import { Bootstrap } from '../../bootstrap/bootstrap';
import { AppModule } from '../../app/app.module';
import { MongoDbService } from '../../shared/infra/database/mongo-db/mongo-db.service';

jest.setTimeout(5000);

describe('[E2E] IdentityAndAccessModule', () => {
  let app: INestApplication;
  let connection: Connection;
  // disabling no-explicit-any for testing purposes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let httpServer: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    Bootstrap.useGlobalSettings(app);
    await app.init();
    httpServer = app.getHttpServer();
    connection = moduleRef.get<MongoDbService>(MongoDbService).getConnection();
    await connection.collection('mongodbusers').deleteMany({});
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
  });

  describe('When a user is created', () => {
    let response: request.Response;
    beforeAll(async () => {
      response = await request(httpServer).post('/api/users');
    });

    test('Then it should return a 201 response status', async () => {
      expect(response.status).toBe(201);
    });

    test('And a user should have been added to the database', async () => {
      const users = await connection
        .collection('mongodbusers')
        .find()
        .toArray();
      expect(users.length).toEqual(1);
    });
  });
});
