import { MigrationInterface, QueryRunner } from 'typeorm';

export class usersInit1664987586516 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "users" (
            "id" SERIAL NOT NULL,
            "login" citext NOT NULL,
            "email" citext NOT NULL,
            "password" character varying NOT NULL,
            "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT "Unique_Login" UNIQUE ("login"),
            CONSTRAINT "Unique_Email" UNIQUE ("email"),
            CONSTRAINT "UserPK" PRIMARY KEY ("id")
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
