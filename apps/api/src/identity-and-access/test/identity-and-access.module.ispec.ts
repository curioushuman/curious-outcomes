import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';

import { Bootstrap } from '../../bootstrap/bootstrap';
import { IdentityAndAccessModule } from './fake.identity-and-access.module';

/**
 * For local integration tests we just want to make sure
 * - endpoints behave how they should
 */

describe('[Integration] IdentityAndAccessModule', () => {
  let app: INestApplication;
  // disabling no-explicit-any for testing purposes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let httpServer: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [IdentityAndAccessModule],
    }).compile();

    app = moduleRef.createNestApplication();
    Bootstrap.useGlobalSettings(app);
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('When a user is created', () => {
    test('Then it should return a 201 response status', async () => {
      const response = await request(httpServer).post('/api/users');

      expect(response.status).toBe(201);
    });
  });
});
