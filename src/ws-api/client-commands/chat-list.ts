import { ChatService } from '../../services/chat';
import { Connection } from '../connection';
import { Client } from '../../types/client-commands/client';
import { Payloads } from '../../types/client-commands/payloads';
import { Server } from '../../types/server-events';

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

    client.response({
      event: Server.Events.CHAT_LIST,
      payload: list,
    });
  },
};
