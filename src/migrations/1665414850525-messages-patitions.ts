import { MigrationInterface, QueryRunner } from 'typeorm';

export class messagesPatitions1665414850525 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "messages" (
            "id" uuid DEFAULT uuid_generate_v4(),
            "chatId" integer REFERENCES chats NOT NULL, 
            "from" integer REFERENCES users NOT NULL,
            "to" integer REFERENCES users,
            "text" text NOT NULL,
            "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT "MessagePK" PRIMARY KEY ("id", "chatId")
        ) PARTITION BY RANGE ("chatId");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('messages');
  }
}
