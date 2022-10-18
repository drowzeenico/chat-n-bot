export namespace ChatTypes {
  export interface CreatePayload {
    name: string;
    password?: string;
  }

  export interface UpdatePayload extends Partial<CreatePayload> {
    chatId: number;
  }
}
