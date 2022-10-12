import * as uuid from 'uuid';

import { WebSocket } from 'ws';
import { IParsedRequest } from '.';
import { MessageModel } from '../models/message';
import { User } from '../models/user';

const IndexById = new Map<string, Client>();
const ChatsIndex = new Map<number, Map<string, Client>>();

export interface Message {
  id: string;
}

export interface UserConnected extends Message {
  message: string;
}

type ServerMessages = Message | UserConnected;

type SystemInfo = {
  // send some message
};

export class Client {
  readonly id: string;
  readonly ip: string;
  readonly version: number;
  readonly token: string;
  readonly user: User;
  private chatId?: number;

  constructor(readonly ws: WebSocket, parsed: IParsedRequest, user: User) {
    this.id = uuid.v4();
    this.ip = parsed.ip!;
    this.version = parsed.verison;
    this.token = parsed.token!;
    this.user = user;

    IndexById.set(this.id, this);
  }

  online(chatId: number) {
    return ChatsIndex.get(chatId)?.size || 0;
  }

  joinToChat(chatId: number) {
    if (!ChatsIndex.has(chatId)) {
      ChatsIndex.set(chatId, new Map<string, Client>());
    }

    const chat = ChatsIndex.get(chatId)!;
    chat.set(this.id, this);
    this.chatId = chatId;

    this.sendToChat(chatId, {});
  }

  leaveChat(chatId: number) {
    if (!ChatsIndex.has(chatId)) return;

    const chat = ChatsIndex.get(chatId)!;
    chat.delete(this.id);
    this.chatId = undefined;
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

  sendToChat(chatId: number, data: MessageModel | SystemInfo) {
    IndexById.forEach((client, id) => {
      if (id === this.id) return;
      client.json(data);
    });
  }

  connected(payload: string) {
    this.sendToAll({ id: this.id, message: payload });
  }
}
