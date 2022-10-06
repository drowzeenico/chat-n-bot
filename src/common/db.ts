import { Config } from './config';
import { DataSource } from 'typeorm';
import { Logger } from './logger';

const logger = Logger('Database');

const Database = new DataSource({
  type: 'postgres',
  url: Config.DB.URL,
  entities: ['src/models/*.{ts,js}'],
  migrations: ['src/migrations/**/*.{ts,js}'],
  migrationsTableName: '_migrations',
  subscribers: ['src/models/subscribers/*.{ts,js}'],
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
});

export default Database;

export const makeDbConnection = async () => {
  try {
    await Database.initialize();
    logger.info('Database has been connected');
  } catch (e) {
    process.exit(1);
  }
};
