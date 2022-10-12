import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type MessageModel = {
  id: string;
  chatId: number;
  from: number;
  to?: number;
  text: string;
  createdAt: string;
  updatedAt: string;
};

export const MessageFactory = (chatId: number) => {
  @Entity('messages_' + chatId, { synchronize: false })
  class Message implements MessageModel {
    @PrimaryGeneratedColumn()
    id: string;

    @PrimaryGeneratedColumn()
    chatId: number;

    @Column({ nullable: false })
    from: number;

    @Column()
    to: number;

    @Column()
    text: string;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: string;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: string;
  }

  return Message;
};
