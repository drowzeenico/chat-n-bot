import Joi from '@hapi/joi';
import { AccessDenied, BadRequestError } from '../../errors';
import { Connection } from '../connection';
import { MessageServices } from '../../services/message';
import { Client } from '../../types/client-commands/client';
import { Payloads } from '../../types/client-commands/payloads';
import { Server } from '../../types/server-events';

const commandValidationRule = Joi.object({
  chatId: Joi.number().required(),
  to: Joi.number().optional(),
  text: Joi.string().required(),
});

export const Message: Client.Command<Payloads.Message> = {
  name: Client.COMMANDS.MESSAGE,

  async process(payload: Payloads.Message, client: Connection): Promise<void> {
    const { error } = commandValidationRule.validate(payload);
    if (error) throw new BadRequestError(error.message, error);

    // is client connected to chat
    if (client.usersChatId !== payload.chatId) {
      throw new AccessDenied("You're not allowed to write to this chat");
    }

    const messageService = new MessageServices(payload.chatId);
    const message = await messageService.save({
      ...payload,
      from: client.user.id,
    });

    client.sendToChat(payload.chatId, {
      event: Server.Events.MESSAGE,
      payload: message.DTO,
    });
  },
};
