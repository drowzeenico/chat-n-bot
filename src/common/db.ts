import "reflect-metadata";

import { Config } from "./config";
import { Connection, createConnection } from "typeorm";
import { Logger } from "./logger";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

const logger = Logger("Database");

class DbAdapter {
  public readonly dbConfig: PostgresConnectionOptions;
  private _connection?: Connection;

  constructor() {
    this.dbConfig = {
      type: "postgres",
      url: Config.DB.URL,
      entities: [__dirname + "/models/*.{ts,js}"],
      migrations: [__dirname + "/migration/**/*.{ts,js}"],
      migrationsTableName: "_migrations",
      subscribers: [__dirname + "/models/subscribers/*.{ts,js}"],
      ssl: Config.DB.USE_SSL,
      synchronize: false,
      extra: {
        ssl: Config.DB.USE_SSL
          ? {
              rejectUnauthorized: false,
            }
          : undefined,
      },
      logging: Config.DB.LOGGING,
      cli: {
        migrationsDir: "src/migration",
        entitiesDir: "src/models",
      },
    };
  }

  async connect() {
    if (this._connection !== undefined) {
      logger.warn("Connection already has been set");
      return this._connection;
    }

    this._connection = await createConnection(this.dbConfig);
    logger.info(
      "Successfully connected to database with SSL=%s",
      this.dbConfig.ssl
    );
    return this._connection;
  }
}

export const Database = new DbAdapter();
