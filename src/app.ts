import * as http from 'http';
import { HttpApi } from './http-api';
import { Config } from './common/config';
import { makeDbConnection } from './common/db';
import { Logger } from './common/logger';
import { WssLauncher } from './ws-api';

const logger = Logger('Application');

async function start() {
  await makeDbConnection();

  const api = new HttpApi().get();
  const httpServer = http.createServer(api);
  httpServer.listen(Config.PORT, '0.0.0.0', () => logger.info('Starting at PORT=%d', Config.PORT));

  new WssLauncher(httpServer);

  const shutdown = async (signal?: NodeJS.Signals) => {
    logger.info(`shutting down servers`, { signal });

    const closeCallback = (label: string) => {
      return (err?: Error) => (err ? logger.error(`close error`, err, { label }) : logger.info(`[${label}] closed`, { label }));
    };

    httpServer.close(closeCallback('HttpServer'));

    const waitToClose = 2_000;
    setTimeout(() => {
      logger.info(`forcefully exit after ${waitToClose}ms`);
      process.exit();
    }, waitToClose).unref();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch(err => logger.error(err));

const process = require('process');

type Row = { [key: string]: number };
type Table = Row[];

const table: Table = [{}];
const round = (num: number, digits: number) => {
  const pow = 10 ** digits;
  return Math.round(num * pow) / pow;
};

for (const [key, value] of Object.entries(process.memoryUsage())) {
  table[0][key] = (value as number) / 1_000_000;
  table[0][key + '_diff'] = round(table[0][key] - table[0][key], 5);
}
console.table(table);

setInterval(() => {
  const parsed: Row = {};

  for (const [key, value] of Object.entries(process.memoryUsage())) {
    parsed[key] = (value as number) / 1_000_000;
    parsed[key + '_diff'] = round(parsed[key] - table[0][key], 5);
  }
  table.push(parsed);
  console.table(table);
}, 10_000);
