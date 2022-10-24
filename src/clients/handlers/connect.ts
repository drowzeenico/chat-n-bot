import { Logger } from '../../common/logger';
import { User } from '../../models/user';
import { getChatData } from '../templates';
import { onMessage } from './message';

import { Client } from '../../types/client-commands/client';
import { HttpAPI } from '../http-api';
import { payload } from '../client';
import { connection } from 'websocket';
import winston from 'winston';

declare module 'websocket' {
  interface connection {
    json(data: Client.Message): void;
    logger: winston.Logger;
  }
}

type onConnectCb = (connection: connection) => Promise<void>;

export const onConnect = (user: User): onConnectCb => {
  return async connection => {
    connection.logger = Logger(`${user.login}`);
    connection.logger.info(`Client ${user.login} with id=${user.id} is connected\n`);

    connection.json = (data: Client.Message) => {
      connection.send(Buffer.from(JSON.stringify(data)));
    };

    if (payload.createChat) {
      connection.logger.info(`Create chat flag is true. Creating chat...`);
      const res = await new HttpAPI(globalThis.token).createChat(getChatData());
      if (!res.success) {
        connection.logger.error("Couldn't create chat: %s", res.error.message);
        connection.logger.info('Trying to connect to another chats...');

        const getChatList: Client.ChatList = {
          name: Client.COMMANDS.CHAT_LIST,
          payload: {},
        };

        connection.json(getChatList);
      } else {
        connection.logger.info('Chat %s has been created\n', res.response.name);
        const joinToChat: Client.JoinToChat = {
          name: Client.COMMANDS.JOIN_TO_CHAT,
          payload: {
            chatId: res.response.id,
          },
        };

        connection.json(joinToChat);
      }
    } else {
      const joinToChat: Client.JoinToChat = {
        name: Client.COMMANDS.JOIN_TO_CHAT,
        payload: {
          chatId: 13, // add chat id
        },
      };

      connection.json(joinToChat);
    }

    connection.on('error', error => {
      connection.logger.error('Connection Error: ' + error.toString());
    });

    connection.on('close', () => {
      connection.logger.warn('Connection Closed');
    });

    connection.on('message', onMessage(connection));
  };
};
