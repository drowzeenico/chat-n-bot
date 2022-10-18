import { MigrationInterface, QueryRunner } from "typeorm";

export class addPasswordToChat1666098365310 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE chats ADD COLUMN password character varying"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE chats DROP COLUMN password");
  }
}
