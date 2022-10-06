import * as uuid from 'uuid';

import { WebSocket } from 'ws';
import { IParsedRequest } from '.';
import { User } from '../models/user';

const IndexById = new Map<string, Client>();

export interface Message {
  id: string;
}

export interface UserConnected extends Message {
  message: string;
}

type ServerMessages = Message | UserConnected;

export class Client {
  readonly id: string;
  readonly ip: string;
  readonly version: number;
  readonly token: string;
  readonly user: User;

  constructor(readonly ws: WebSocket, parsed: IParsedRequest, user: User) {
    this.id = uuid.v4();
    this.ip = parsed.ip!;
    this.version = parsed.verison;
    this.token = parsed.token!;
    this.user = user;

    IndexById.set(this.id, this);
  }

  json(data: object) {
    this.ws.send(JSON.stringify(data));
  }

  sendById(clientIds: string[], data: ServerMessages) {
    clientIds.forEach(id => {
      if (IndexById.has(id)) {
        IndexById.get(id)?.json(data);
      }
    });
  }

  sendToAll(data: ServerMessages) {
    IndexById.forEach((client, id) => {
      if (id === this.id) return;
      client.json(data);
    });
  }

  connected(payload: string) {
    this.sendToAll({ id: this.id, message: payload });
  }
}
