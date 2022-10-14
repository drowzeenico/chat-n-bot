import { ChatService } from '../../services/chat';
import { Connection } from '../connection';
import { Client } from './types/client';
import { Payloads } from './types/payloads';

export const ChatList: Client.Command<Payloads.ChatList> = {
  name: Client.COMMANDS.CHAT_LIST,

  async process(payload: Payloads.ChatList, client: Connection) {
    const chatList = await ChatService.list();

    const list = chatList.map(chat => {
      return {
        chat: chat.DTO,
        online: client.online(chat.id),
      };
    });

    const response: Client.ChatList = {
      command: Client.COMMANDS.CHAT_LIST,
      result: list,
      success: true,
    };

    client.response(response);
  },
};
