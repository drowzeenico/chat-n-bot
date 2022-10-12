import { chatDTO } from '../../models/chat';
import { ChatService } from '../../services/chat';
import { Client } from '../connection';
import { ICommand } from './router';

export interface ChatListPayload {}

export type ChatListResponse = {
  chat: chatDTO;
  online: number;
}[];

export const ChatList: ICommand<ChatListPayload, ChatListResponse> = {
  name: 'chat-list',

  async process(payload: ChatListPayload, client: Client): Promise<ChatListResponse> {
    const chatList = await ChatService.list();

    return chatList.map(chat => {
      return {
        chat: chat.DTO,
        online: client.online(chat.id),
      };
    });
  },
};
