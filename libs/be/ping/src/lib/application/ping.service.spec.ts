import { Test, TestingModule } from '@nestjs/testing';

import { PingPong } from '../domain/ping';
import { PingService } from '../application/ping.service';
jest.mock('../application/ping.service');

describe('PingController', () => {
  let service: PingService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [PingService],
    }).compile();

    service = moduleRef.get<PingService>(PingService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });

  describe('getPing', () => {
    it('Should return a Ping', async () => {
      const ping = await service.getPing();
      expect(ping).toBe(PingPong.Ping);
    });
  });
});
