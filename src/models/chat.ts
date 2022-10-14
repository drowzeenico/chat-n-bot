import { pick } from 'lodash';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type chatDTO = Pick<Chat, 'id' | 'owner' | 'name'>;

@Entity('chats', { synchronize: false })
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  owner: number;

  @Column({ nullable: false })
  name: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  get DTO(): chatDTO {
    return pick(this, ['id', 'owner', 'name']);
  }
}
