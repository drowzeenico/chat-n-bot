import { pick } from 'lodash';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type MessageDTO = Pick<Message, 'id' | 'from' | 'to' | 'text' | 'createdAt'>;

@Entity({ synchronize: false })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  chatId: number;

  @Column({ nullable: false })
  from: number;

  @Column()
  to: number;

  @Column()
  text: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  get DTO(): MessageDTO {
    return pick(this, ['id', 'from', 'to', 'text', 'createdAt']);
  }
}
