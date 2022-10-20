import { WebSocket } from 'ws';
import { IParsedRequest } from '.';
import { User } from '../models/user';
import { Server } from '../types/server-events';

const IndexById = new Map<number, Connection>();
const ChatsIndex = new Map<number, Map<number, Connection>>();

export class Connection {
  readonly id: number;
  readonly ip: string;
  readonly version: number;
  readonly token: string;
  readonly user: User;
  private chatId?: number;

  constructor(readonly ws: WebSocket, parsed: IParsedRequest, user: User) {
    this.ip = parsed.ip!;
    this.version = parsed.verison;
    this.token = parsed.token!;
    this.user = user;
    this.id = this.user.id;

    IndexById.set(this.id, this);
  }

  get usersChatId() {
    return this.chatId;
  }

  // send to client
  response(data: Server.IEvent) {
    this.json(data);
  }

  online(chatId: number) {
    return ChatsIndex.get(chatId)?.size || 0;
  }

  joinToChat(chatId: number) {
    if (!ChatsIndex.has(chatId)) {
      ChatsIndex.set(chatId, new Map<number, Connection>());
    }

    const chat = ChatsIndex.get(chatId)!;
    if (chat.has(this.id)) return;

    chat.set(this.id, this);
    this.chatId = chatId;

    this.sendToChat(chatId, {
      event: Server.Events.JOINED,
      payload: {
        userId: this.id,
      },
    });
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

  sendById(clientIds: number[], data: Server.IEvent) {
    clientIds.forEach(id => {
      if (IndexById.has(id)) {
        IndexById.get(id)?.json(data);
      }
    });
  }

  sendToAll(data: Server.IEvent) {
    IndexById.forEach((client, id) => {
      if (id === this.id) return;
      client.json(data);
    });
  }

  sendToChat(chatId: number, data: Server.IEvent) {
    if (!ChatsIndex.has(chatId)) return;
    const chat = ChatsIndex.get(chatId)!;

    for (const client of chat.values()) {
      client.json(data);
    }
  }

  connected() {
    this.sendToAll({
      event: Server.Events.CONNECTED,
      payload: {
        userId: this.id,
      },
    });
  }

  disconnect() {
    IndexById.delete(this.id);
    if (this.chatId) {
      ChatsIndex.get(this.chatId)?.delete(this.id);
    }
  }
}
