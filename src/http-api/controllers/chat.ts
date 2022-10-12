import Joi from '@hapi/joi';
import { Logger } from '../../common/logger';
import { BadRequestError } from '../../errors';
import { Chat } from '../../models/chat';
import { ChatService } from '../../services/chat';

const logger = Logger('Chat Controller');

export type ChatUpdateData = {
  chatId: number;
  name: string;
};

export const ChatController = {
  async create(owner: number, name: string): Promise<Chat> {
    logger.info(name);
    const validationRules = Joi.string().required();

    const { error } = validationRules.validate(name);
    if (error) throw new BadRequestError('Validation error:' + error.message);

    return await ChatService.create(owner, name);
  },

  async update(owner: number, data: ChatUpdateData): Promise<Chat> {
    const validationRules = Joi.object({
      chatId: Joi.number().required(),
      name: Joi.string().required(),
    }).required();

    const { error } = validationRules.validate(data);
    if (error) throw new BadRequestError('Validation error:' + error.message);

    return await ChatService.update(owner, data);
  },

  async remove(owner: number, chatId: number): Promise<Chat> {
    const validationRules = Joi.number().required();

    const { error } = validationRules.validate(chatId);
    if (error) throw new BadRequestError('Validation error:' + error.message);

    return await ChatService.remove(owner, chatId);
  },
};
