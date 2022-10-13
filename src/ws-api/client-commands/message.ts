import Joi from '@hapi/joi';
import { AccessDenied, BadRequestError } from '../../errors';
import { Connection } from '../connection';
import { MessageServices } from '../../services/message';
import { Client } from './types/client';
import { Payloads } from './types/payloads';
import { Server } from '../server-events';

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

    if (client.usersChatId !== payload.chatId) throw new AccessDenied("You're not allowed to write to this chat");

    const messages = new MessageServices(payload.chatId);
    const newMessage = await messages.save({
      ...payload,
      from: client.user.id,
    });

    const messageToChat: Server.Message = {
      event: Server.Events.MESSAGE,
      payload: {
        from: client.id,
        to: payload.to,
        text: payload.text,
      },
    };
    client.sendToChat(payload.chatId, messageToChat);
  },
};
