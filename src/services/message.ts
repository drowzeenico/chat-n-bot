import Database from '../common/db';
import { MessageFactory, MessageModel } from '../models/message';

export type NewMessage = Pick<MessageModel, 'chatId' | 'from' | 'to' | 'text'>;

export class MessageServices {
  private repo;
  constructor(chatId: number) {
    const MessageEntity = MessageFactory(chatId);
    this.repo = Database.getRepository(MessageEntity);
  }

  async save(data: NewMessage): Promise<MessageModel> {
    const messageDTO = this.repo.create(data);
    return await this.repo.save(messageDTO);
  }
}
