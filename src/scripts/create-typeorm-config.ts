import * as fs from 'fs';
import * as path from 'path';
import Database from '../common/db';
import { Logger } from '../common/logger';

const logger = Logger('TypeORM Config');

logger.info('Writing TypeORM config to ormconfig.json...');
const dbConfig = Database.options;
const data = JSON.stringify(dbConfig, null, 2);

const filePath = path.join(__dirname, '../common', 'ormconfig.json');
fs.writeFileSync(filePath, data);
