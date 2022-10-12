import Joi from '@hapi/joi';
import { BadRequestError, ResourceNotFound } from '../../errors';
import { chatDTO } from '../../models/chat';
import { ChatService } from '../../services/chat';
import { Client } from '../connection';
import { ICommand } from './router';

export interface JoinToChatPayload {
  chatId: number;
}

export interface JoinToChatResponse {
  chat: chatDTO;
  online: number;
}

const commandValidationRule = Joi.object({
  chatId: Joi.number().required(),
});

export const JoinToChat: ICommand<JoinToChatPayload, JoinToChatResponse> = {
  name: 'join-to-chat',

  async process(payload: JoinToChatPayload, client: Client): Promise<JoinToChatResponse> {
    const { error } = commandValidationRule.validate(payload);
    if (error) throw new BadRequestError(error.message, error);

    const chat = await ChatService.findChat(payload.chatId);
    if (!chat) throw new ResourceNotFound('Selected chat is not exists');

    return {
      chat: chat.DTO,
      online: client.online(chat.id),
    };
  },
};
