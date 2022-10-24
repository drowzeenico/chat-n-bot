import { Config } from '../common/config';
import { client } from 'websocket';
import { stringify } from 'querystring';

import { Logger } from '../common/logger';
import { PASSWORD } from './templates';
import { User } from '../models/user';
import Database, { makeDbConnection } from '../common/db';

import { HttpAPI } from './http-api';
import { onConnect } from './handlers/connect';

export type ThreadData = {
  userId: number;
  createChat: boolean;
};

declare global {
  var token: string;
}

const logger = Logger(`Client thread`);

process.on('unhandledRejection', (reason, promise) => {
  logger.error('UNHANDLED', reason);
});

export const payload: ThreadData = {
  userId: +process.argv[2],
  createChat: process.argv[3] === 'true' ? true : false,
};

const connect = async (token: string, user: User) => {
  const ws = new client();

  const ws_api = [Config.WSAPI, stringify({ token })].join('?');
  ws.connect(ws_api);

  ws.on('connectFailed', error => {
    logger.error('Connect Error: ' + error.toString());
  });

  ws.on('connect', onConnect(user));
};

(async () => {
  const http = new HttpAPI();

  await makeDbConnection();
  const user = await Database.getRepository(User).findOneBy({ id: payload.userId });
  if (!user) {
    logger.error('Selected user with id#' + payload.userId + 'was not found');
    process.exit(1);
  }

  const res = await http.auth({ login: user.login, password: PASSWORD });
  if (!res.success) {
    logger.error(`User#${user.id} couldn't authorize`, res.error.message);
    process.exit(1);
  }

  globalThis.token = res.response;

  connect(res.response, user);
})();
