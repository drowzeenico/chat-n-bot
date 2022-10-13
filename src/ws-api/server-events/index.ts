export namespace Server {
  export enum Events {
    CONNECTED = 'user-connected',
    JOINED = 'joined-to-chat',
    LEAVED = 'leaved-chat',
    MESSAGE = 'message-to-chat',
  }

  export interface IEvent {
    event: Events;
    payload: unknown;
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
    payload: {
      from: number;
      to?: number;
      text: string;
    };
  }
}
