import { PingPong } from '../../domain/ping';

export const PingService = jest.fn().mockReturnValue({
  getPing: jest.fn().mockImplementation(() => Promise.resolve(PingPong.Ping)),
});
