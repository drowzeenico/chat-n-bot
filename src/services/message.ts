import Database from "../common/db";
import { AppError } from "../errors";
import { Message } from "../models/message";

export type NewMessage =
  | Pick<Message, "chatId" | "from" | "text">
  | {
      to?: number;
    };
export class MessageServices {
  private repo;

  constructor(chatId: number) {
    this.repo = Database.getRepository(Message);
    this.repo.metadata.tablePath = "messages_" + chatId;
  }

  async save(data: NewMessage): Promise<Message> {
    try {
      const dto = this.repo.create(data);
      return await this.repo.save(dto);
    } catch (e) {
      throw new AppError("Can't send message due server error", e as Error);
    }
  }
}
