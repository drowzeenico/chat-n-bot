import Joi from '@hapi/joi';
import { BadRequestError } from '../../errors';
import { Client } from '../connection';
import { ICommand } from './router';
import { MessageServices } from '../../services/message';
import { MessageModel } from '../../models/message';

export interface MessagePayload {
  chatId: number;
  to?: number;
  text: string;
}

export interface MessageResponse extends MessageModel {}

const commandValidationRule = Joi.object({
  chatId: Joi.number().required(),
  to: Joi.number().optional(),
  text: Joi.string().required(),
});

export const Message: ICommand<MessagePayload, MessageResponse> = {
  name: 'message',

  async process(payload: MessagePayload, client: Client): Promise<MessageResponse> {
    const { error } = commandValidationRule.validate(payload);
    if (error) throw new BadRequestError(error.message, error);

    const messages = new MessageServices(payload.chatId);
    const newMessage = await messages.save({
      ...payload,
      from: client.user.id,
    });

    // send to CHAT
    client.sendToAll({
      id: client.id,
      message: 'HELLO MESSAGE FROM ' + client.id,
    });

    return newMessage;
  },
};
