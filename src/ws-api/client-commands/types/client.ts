import { chatDTO } from '../../../models/chat';
import { Connection } from '../../connection';
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

  export interface IResponse {
    command?: COMMANDS;
    success: boolean;
    result?: unknown;
  }

  export interface ErrorResponse extends IResponse {
    error: {
      message: string;
      object: Error;
    };
  }

  export interface ChatList extends IResponse {
    command: COMMANDS.CHAT_LIST;
    success: true;
    result: {
      chat: chatDTO;
      online: number;
    }[];
  }
}
