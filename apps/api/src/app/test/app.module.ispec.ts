import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { PingModule } from '@curioushuman/ping';

import { Bootstrap } from '../../bootstrap/bootstrap';

/**
 * For local integration tests we just want to make sure
 * - we're returning a ping
 */

describe('[Integration] PingModule', () => {
  let app: INestApplication;
  // disabling no-explicit-any for testing purposes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let httpServer: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [PingModule],
    }).compile();

    app = moduleRef.createNestApplication();
    Bootstrap.useGlobalSettings(app);
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('When ping is requested', () => {
    test('Then it should return a Ping', async () => {
      const response = await request(httpServer).get('/api/ping');

      expect(response.status).toBe(200);
    });
  });
});
