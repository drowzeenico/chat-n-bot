import { WebSocket } from 'ws';

export interface IConnection extends WebSocket {
  id: string;
  ip: string;
  version: number;
  token?: string;
}
