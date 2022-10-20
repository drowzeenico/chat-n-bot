import { chatDTO } from '../../models/chat';
import { MessageDTO } from '../../models/message';

export namespace Server {
  export enum Events {
    CONNECTED = 'user-connected',
    JOINED = 'joined-to-chat',
    LEAVED = 'leaved-chat',
    MESSAGE = 'message-to-chat',
    CHAT_LIST = 'chat-list',
  }

  export interface IEvent {
    event: Events;
    payload: unknown;
    error?: Error;
  }

  export interface Connected extends IEvent {
    event: Events.CONNECTED;
    payload: {
      userId: number;
    };
  }

  export interface Joined extends IEvent {
    event: Events.JOINED;
    payload: {
      userId: number;
    };
  }

  export interface Leaved extends IEvent {
    event: Events.LEAVED;
    payload: {
      userId: number;
    };
  }

  export interface Message extends IEvent {
    event: Events.MESSAGE;
    payload: MessageDTO;
  }

  export interface ChatList extends IEvent {
    event: Events.CHAT_LIST;
    payload: {
      chat: chatDTO;
      online: number;
    }[];
  }
}
