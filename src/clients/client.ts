import { Config } from '../common/config';
import { client } from 'websocket';
import { stringify } from 'querystring';

import { Logger } from '../common/logger';
import { getPause, PASSWORD } from './list';
import { ClientManager } from './manager';
import { User } from '../models/user';
import { makeDbConnection } from '../common/db';
import { Client } from '../ws-api/client-commands/types/client';
import { UnsupportedCommandFormatError } from '../errors';
import Joi from '@hapi/joi';

process.on('unhandledRejection', (reason, promise) => {
  logger.error('UNHANDLED', reason);
});

const logger = Logger('Client');
const MAX_CLIENTS = 100;

(async () => {
  await makeDbConnection();
  const Manager = new ClientManager();
  await Manager.init();

  let clientsConnected = 0;
  for (const user of Manager.clients) {
    const token = await Manager.auth({ login: user.login, password: PASSWORD });
    setTimeout(async () => {
      if (clientsConnected >= MAX_CLIENTS) return;

      connect(token, user);
      clientsConnected++;
    }, getPause());
  }
})();

const connect = async (token: string, user: User) => {
  const ws = new client();

  const ws_api = [Config.WSAPI, stringify({ token })].join('?');
  ws.connect(ws_api);

  ws.on('connectFailed', error => {
    logger.error('Connect Error: ' + error.toString());
  });

  ws.on('connect', connection => {
    logger.info(`Client ${user.login} with id=${user.id} is connected`);

    const getChatList = JSON.stringify({
      name: 'chat-list',
      payload: {},
    });

    connection.send(Buffer.from(getChatList));

    connection.on('error', error => {
      logger.error('Connection Error: ' + error.toString());
    });

    connection.on('close', () => {
      logger.warn('Connection Closed');
    });

    connection.on('message', message => {
      if (message.type === 'utf8') {
        try {
          const msg = JSON.parse(message.utf8Data) as Client.Message;
          const commandValidationRule = Joi.object({
            name: Joi.string().required(),
            payload: Joi.object().required(),
          }).required();

          const { error, value } = commandValidationRule.validate(msg);
          if (error) {
            const e = new UnsupportedCommandFormatError(`Unsupported format: ${error!.message}`);
            return connection.send(JSON.stringify(buildError(e, msg)));
          }
          switch (msg.name) {
          }
        } catch (e) {
          logger.error(e);
        }
      }
    });
  });
};

const buildError = (err: Error, cmd?: Client.Message): Client.ErrorResponse => {
  return {
    command: cmd?.name,
    success: false,
    error: {
      message: err.message,
      object: err,
    },
  };
};
