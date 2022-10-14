import Database from '../common/db';
import { AppError, ResourceNotFound } from '../errors';
import { ChatUpdateData } from '../http-api/controllers/chat';
import { Chat } from '../models/chat';

class ChatServices {
  private repo = Database.getRepository(Chat);

  async list(): Promise<Chat[]> {
    return await this.repo.find();
  }

  async findChat(chatId: number): Promise<Chat | null> {
    return await this.repo.findOneBy({ id: chatId });
  }

  async create(owner: number, name: string): Promise<Chat> {
    const chatDTO = this.repo.create({
      name: name,
      owner: owner,
    });

    const chat = await this.repo.save(chatDTO);

    await this.repo.query(`
      CREATE TABLE messages_${chat.id} PARTITION OF messages
      FOR VALUES FROM ('${chat.id}') TO ('${chat.id + 1}');
    `);

    return chat;
  }

  async update(owner: number, data: ChatUpdateData): Promise<Chat> {
    const chat = await this.repo.findOneBy({ id: data.chatId });
    if (!chat) throw new ResourceNotFound('Requested chat is missing');

    if (chat.owner !== owner) throw new AppError("You don't have permissions to change this chat");

    chat.name = data.name;
    return await this.repo.save(chat);
  }

  async remove(owner: number, chatId: number): Promise<Chat> {
    const chat = await this.repo.findOneBy({ id: chatId });
    if (!chat) throw new ResourceNotFound('Requested chat is missing');

    if (chat.owner !== owner) throw new AppError("You don't have permissions to change this chat");

    await this.repo.query(`
      DROP TABLE messages_${chat.id};
    `);

    return await this.repo.remove(chat);
  }
}

export const ChatService = new ChatServices();
