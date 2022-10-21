import { chatDTO } from '../../models/chat';
import { Connection } from '../../ws-api/connection';
import { Payloads } from './payloads';

export namespace Client {
  export enum COMMANDS {
    JOIN_TO_CHAT = 'join-to-chat',
    CHAT_LIST = 'chat-list',
    MESSAGE = 'message',
  }

  export interface Command<I> {
    readonly name: COMMANDS;
    process(payload: I, connection: Connection): Promise<void>;
  }

  export interface Message {
    name: COMMANDS;
    payload: Payloads.List;
  }
  export interface ChatList extends Message {
    name: COMMANDS.CHAT_LIST;
    payload: Payloads.ChatList;
  }

  export interface JoinToChat extends Message {
    name: COMMANDS.JOIN_TO_CHAT;
    payload: Payloads.JoinToChat;
  }

  export interface IResponse {
    command?: COMMANDS;
    result?: unknown;
  }

  export interface ErrorResponse extends IResponse {
    error: {
      message: string;
      object: Error;
    };
  }
}
