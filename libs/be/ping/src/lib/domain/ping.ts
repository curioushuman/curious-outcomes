export enum PingPong {
  Ping = 'PING',
  Pong = 'PONG',
}
export type Ping = PingPong.Ping | PingPong.Pong;
