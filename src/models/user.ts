import { pick } from 'lodash';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type UserDto = Pick<User, 'id' | 'email' | 'login' | 'createdAt'>;

@Entity('users', { synchronize: false })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  login: string;

  @Column({ nullable: false })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: string;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: string;

  get DTO(): UserDto {
    return pick(this, ['id', 'login', 'email', 'createdAt']);
  }
}
