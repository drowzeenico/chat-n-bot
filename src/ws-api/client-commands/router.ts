import { Client } from '../connection';
import { IClientMessage } from '../server';
import { ChatList, ChatListPayload, ChatListResponse } from './chat-list';
import { JoinToChat, JoinToChatPayload, JoinToChatResponse } from './join-to-chat';
import { Message, MessagePayload, MessageResponse } from './message';

export interface ICommand<I, O> {
  readonly name: string;

  process(payload: I, client: Client): Promise<O>;
}

type ICommandProcessors = typeof ChatList.process | typeof JoinToChat.process | typeof Message.process;
export type IPayload = Parameters<ICommandProcessors>[0];
export type IResponse = Awaited<ReturnType<ICommandProcessors>>;

type Handler = (msg: IClientMessage, client: Client) => Promise<IResponse>;

export const Router = new Map<string, Handler>();

Router.set(ChatList.name, async (msg: IClientMessage, client: Client): Promise<ChatListResponse> => {
  return await ChatList.process(msg.payload as ChatListPayload, client);
});

Router.set(JoinToChat.name, async (msg: IClientMessage, client: Client): Promise<JoinToChatResponse> => {
  return await JoinToChat.process(msg.payload as JoinToChatPayload, client);
});

Router.set(Message.name, async (msg: IClientMessage, client: Client): Promise<MessageResponse> => {
  return await Message.process(msg.payload as MessagePayload, client);
});
