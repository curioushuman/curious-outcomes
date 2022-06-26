import { Test, TestingModule } from '@nestjs/testing';

import { PingController } from './ping.controller';

import { PingService } from '../application/ping.service';
jest.mock('../application/ping.service');

describe('PingController', () => {
  let controller: PingController;
  let service: PingService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PingController],
      providers: [PingService],
    }).compile();

    controller = moduleRef.get<PingController>(PingController);
    service = moduleRef.get<PingService>(PingService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeTruthy();
  });

  describe('getPing', () => {
    describe('When ping is requested', () => {
      test('Then it should call the Ping service', async () => {
        await controller.getPing();

        expect(service.getPing).toHaveBeenCalled();
      });
    });
  });
});
