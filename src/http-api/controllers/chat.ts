import Joi from "@hapi/joi";
import { Logger } from "../../common/logger";
import { BadRequestError } from "../../errors";
import { chatDTO } from "../../models/chat";
import { ChatService } from "../../services/chat";
import { ChatTypes } from "../../types/chat";

const logger = Logger("Chat Controller");

export const ChatController = {
  async create(owner: number, data: ChatTypes.CreatePayload): Promise<chatDTO> {
    const validationRules = Joi.object({
      name: Joi.string().required(),
      password: Joi.string().optional(),
    }).required();

    const { error } = validationRules.validate(data);
    if (error) throw new BadRequestError("Validation error:" + error.message);

    const chat = await ChatService.create(owner, data);
    return chat.DTO;
  },

  async update(owner: number, data: ChatTypes.UpdatePayload): Promise<chatDTO> {
    const validationRules = Joi.object({
      chatId: Joi.number().required(),
      name: Joi.string().required(),
      password: Joi.string().optional(),
    }).required();

    const { error } = validationRules.validate(data);
    if (error) throw new BadRequestError("Validation error:" + error.message);

    const chat = await ChatService.update(owner, data);
    return chat.DTO;
  },

  async remove(owner: number, chatId: number): Promise<chatDTO> {
    const validationRules = Joi.number().required();

    const { error } = validationRules.validate(chatId);
    if (error) throw new BadRequestError("Validation error:" + error.message);

    const chat = await ChatService.remove(owner, chatId);
    return chat.DTO;
  },
};
