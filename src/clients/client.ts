import { Config } from '../common/config';
import { client } from 'websocket';
import { stringify } from 'querystring';
import { workerData } from 'worker_threads';

import { Logger } from '../common/logger';
import { getChatData, PASSWORD } from './templates';
import { User } from '../models/user';
import Database, { makeDbConnection } from '../common/db';
import Joi from '@hapi/joi';
import { Server } from '../types/server-events';
import { Client } from '../types/client-commands/client';

import { ThreadData } from '.';
import { HttpAPI } from './http-api';
import { sample } from 'lodash';

const logger = Logger(`[Client thread]`);

process.on('unhandledRejection', (reason, promise) => {
  logger.error('UNHANDLED', reason);
});

const payload: ThreadData = workerData;
const http = new HttpAPI();

const connect = async (token: string, user: User) => {
  const ws = new client();

  const ws_api = [Config.WSAPI, stringify({ token })].join('?');
  ws.connect(ws_api);

  ws.on('connectFailed', error => {
    logger.error('Connect Error: ' + error.toString());
  });

  ws.on('connect', async connection => {
    logger.info(`Client ${user.login} with id=${user.id} is connected`);

    const send = (data: Client.Message) => {
      connection.send(Buffer.from(JSON.stringify(data)));
    };

    if (payload.createChat) {
      const res = await http.createChat(getChatData());
      if (!res.success) {
        logger.error("Couldn't create chat", res.error.message);
        logger.info('Trying to connect to another chats...');

        const chatList: Client.ChatList = {
          name: Client.COMMANDS.CHAT_LIST,
          payload: {},
        };

        send(chatList);
      } else {
        const joinToChat: Client.JoinToChat = {
          name: Client.COMMANDS.JOIN_TO_CHAT,
          payload: {
            chatId: res.response.id,
          },
        };

        send(joinToChat);
      }
    }

    connection.on('error', error => {
      logger.error('Connection Error: ' + error.toString());
    });

    connection.on('close', () => {
      logger.warn('Connection Closed');
    });

    connection.on('message', async msg => {
      if (msg.type === 'utf8') {
        try {
          const message = JSON.parse(msg.utf8Data) as Server.IEvent;
          const commandValidationRule = Joi.object({
            name: Joi.string().required(),
            payload: Joi.object().required(),
          }).required();

          const { error, value } = commandValidationRule.validate(message);
          if (error) {
            return logger.error(`Unsupported format: ${error.message}`);
          }

          switch (message.event) {
            case Server.Events.CHAT_LIST:
              {
                // connect to random chat from avalible chats
                const data = message as Server.ChatList;
                const ids = data.payload.map(c => c.chat.id);
                const randId = sample(ids);
                if (!randId) {
                  // what to do is chat doesn't exist?
                }

                const joinToChat: Client.JoinToChat = {
                  name: Client.COMMANDS.JOIN_TO_CHAT,
                  payload: {
                    chatId: randId!,
                  },
                };

                send(joinToChat);
              }
              break;

            case Server.Events.JOINED:
              {
              }
              break;

            case Server.Events.LEAVED:
              {
              }
              break;

            case Server.Events.MESSAGE:
              {
              }
              break;
          }
        } catch (e) {
          logger.error(e);
        }
      }
    });
  });
};

(async () => {
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

  connect(res.response, user);
})();
