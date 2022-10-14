import { Connection } from '../connection';
import { ChatList } from './chat-list';
import { JoinToChat } from './join-to-chat';
import { Message } from './message';
import { Client } from './types/client';
import { Payloads } from './types/payloads';

type Handler = (msg: Client.Message, connection: Connection) => Promise<void>;

export const Router = new Map<Client.COMMANDS, Handler>();

Router.set(ChatList.name, async (msg: Client.Message, connection: Connection) => {
  return await ChatList.process(msg.payload as Payloads.ChatList, connection);
});

Router.set(JoinToChat.name, async (msg: Client.Message, connection: Connection) => {
  return await JoinToChat.process(msg.payload as Payloads.JoinToChat, connection);
});

Router.set(Message.name, async (msg: Client.Message, connection: Connection) => {
  return await Message.process(msg.payload as Payloads.Message, connection);
});
