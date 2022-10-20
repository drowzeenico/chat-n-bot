export namespace Payloads {
  export interface JoinToChat {
    chatId: number;
  }

  export interface ChatList {}

  export interface Message {
    chatId: number;
    to?: number;
    text: string;
  }

  export type List = JoinToChat | ChatList | Message;
}
