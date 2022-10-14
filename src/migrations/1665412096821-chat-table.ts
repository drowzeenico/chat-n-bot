import { MigrationInterface, QueryRunner } from 'typeorm';

export class chatTable1665412096821 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "chats" (
            "id" SERIAL NOT NULL,
            "owner" integer REFERENCES users,
            "name" citext NOT NULL,
            "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT "Unique_Name" UNIQUE ("id", "name"),
            CONSTRAINT "ChatPK" PRIMARY KEY ("id")
        )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('chats');
  }
}
