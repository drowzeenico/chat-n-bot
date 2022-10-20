import Joi from '@hapi/joi';
import { Client } from '../../types/client-commands/client';
import { BadRequestError, ResourceNotFound } from '../../errors';
import { ChatService } from '../../services/chat';
import { Connection } from '../connection';
import { Payloads } from '../../types/client-commands/payloads';

const commandValidationRule = Joi.object({
  chatId: Joi.number().required(),
});

export const JoinToChat: Client.Command<Payloads.JoinToChat> = {
  name: Client.COMMANDS.JOIN_TO_CHAT,

  async process(payload: Payloads.JoinToChat, client: Connection) {
    const { error } = commandValidationRule.validate(payload);
    if (error) throw new BadRequestError(error.message, error);

    const chat = await ChatService.findChat(payload.chatId);
    if (!chat) throw new ResourceNotFound('Selected chat is not exists');

    client.joinToChat(chat.id);
  },
};
