import Database from "../common/db";
import { AppError, ResourceNotFound } from "../errors";
import { Chat } from "../models/chat";
import { ChatTypes } from "../types/chat";
import { UserServices } from "./user";

class ChatServices {
  private repo = Database.getRepository(Chat);

  async list(): Promise<Chat[]> {
    return await this.repo.find();
  }

  async findChat(chatId: number): Promise<Chat | null> {
    return await this.repo.findOneBy({ id: chatId });
  }

  async create(owner: number, data: ChatTypes.CreatePayload): Promise<Chat> {
    if (data.password) {
      data.password = UserServices.hashPassword(data.password);
    }

    const chatDTO = this.repo.create({
      ...data,
      owner: owner,
    });

    const chat = await this.repo.save(chatDTO);

    await this.repo.query(`
      CREATE TABLE messages_${chat.id} PARTITION OF messages
      FOR VALUES FROM ('${chat.id}') TO ('${chat.id + 1}');
    `);

    return chat;
  }

  async update(owner: number, data: ChatTypes.UpdatePayload): Promise<Chat> {
    const chat = await this.repo.findOneBy({ id: data.chatId });
    if (!chat) throw new ResourceNotFound("Requested chat is missing");

    if (chat.owner !== owner)
      throw new AppError("You don't have permissions to change this chat");

    if (data.name) {
      chat.name = data.name;
    }

    if (data.password) {
      chat.password = UserServices.hashPassword(data.password);
    }
    return await this.repo.save(chat);
  }

  async remove(owner: number, chatId: number): Promise<Chat> {
    const chat = await this.repo.findOneBy({ id: chatId });
    if (!chat) throw new ResourceNotFound("Requested chat is missing");

    if (chat.owner !== owner)
      throw new AppError("You don't have permissions to change this chat");

    await this.repo.query(`
      DROP TABLE messages_${chat.id};
    `);

    return await this.repo.remove(chat);
  }
}

export const ChatService = new ChatServices();
