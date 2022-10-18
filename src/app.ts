import * as http from 'http';
import { HttpApi } from './http-api';
import { Config } from './common/config';
import { makeDbConnection } from './common/db';
import { Logger } from './common/logger';
import { WssLauncher } from './ws-api';
import { ConfigError } from './errors';

const logger = Logger('Application');

class Chat_n_Bot_Application {
  private httpServer: http.Server;
  private wsServer: WssLauncher;

  async start() {
    await makeDbConnection();

    const api = new HttpApi().get();
    const httpServer = http.createServer(api);
    httpServer.listen(Config.PORT, Config.HTTP_API_URL, () => logger.info('Starting at PORT=%d', Config.PORT));

    this.wsServer = new WssLauncher(httpServer);
  }

  shutdown(signal?: NodeJS.Signals) {
    logger.warn('Terminatig the process...', { signal });

    const closeCallback = (label: string) => {
      return (err?: Error) => {
        if (err) {
          return logger.error(`Couldn't halt ${label} server`, { err });
        }

        logger.info(`${label} has been shutted down`);
      };
    };

    logger.info(`shutting down servers`);
    if (this.httpServer) {
      this.httpServer.close(closeCallback('Http server'));
    }

    if (this.wsServer) {
      this.wsServer.close(closeCallback('WebSocket server'));
    }

    setTimeout(() => {
      logger.warn('Forcefully closing process after 2 sec');
      process.exit(1);
    }, 2_000);
  }

  memoryUsage() {
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
  }
}

const app = new Chat_n_Bot_Application();
app.start().catch(err => logger.error(err));

process.on('unhandledRejection', (reason, promise) => {
  if (reason instanceof ConfigError) {
    logger.error(reason.message, { reason });
    process.exit(1);
  }
});

process.on('SIGINT', app.shutdown);
process.on('SIGTERM', app.shutdown);
