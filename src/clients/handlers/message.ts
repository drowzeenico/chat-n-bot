import Joi from '@hapi/joi';
import { sample } from 'lodash';
import { connection, Message } from 'websocket';
import { Client } from '../../types/client-commands/client';
import { Server } from '../../types/server-events';

export const onMessage = (conn: connection) => {
  return async (msg: Message) => {
    if (msg.type !== 'utf8') {
      return conn.logger.error('Message is not UTF8 fromat');
    }

    try {
      const message = JSON.parse(msg.utf8Data) as Server.IEvent;
      const commandValidationRule = Joi.object({
        event: Joi.string().required(),
        payload: Joi.object().required(),
        error: Joi.object().optional(),
      }).required();

      const { error } = commandValidationRule.validate(message);
      if (error) {
        return conn.logger.error(`Unsupported format: ${error.message}`);
      }

      switch (message.event) {
        case Server.Events.CHAT_LIST:
          {
            // connect to random chat from avalible chats
            const data = message as Server.ChatList;
            const ids = data.payload.map(c => c.chat.id);
            const randId = sample(ids);
            if (!randId) {
              return conn.logger.warn("Couldn't connect to chat#" + randId);
            }

            const joinToChat: Client.JoinToChat = {
              name: Client.COMMANDS.JOIN_TO_CHAT,
              payload: {
                chatId: randId!,
              },
            };

            conn.json(joinToChat);
          }
          break;

        case Server.Events.JOINED:
          {
            const data = message as Server.Joined;
            conn.logger.info(`User #${data.payload.userId} connected to chat`);
          }
          break;

        case Server.Events.LEAVED:
          {
            const data = message as Server.Leaved;
            conn.logger.info(`User #${data.payload.userId} leaved the chat`);
          }
          break;

        case Server.Events.MESSAGE:
          {
            const data = message as Server.Message;
            const to = data.payload.to ? 'to user#' + data.payload.to : '';
            conn.logger.info(`User#${data.payload.from} ${to}: ${data.payload.text}`);
          }
          break;
      }
    } catch (e) {
      conn.logger.error(e);
    }
  };
};
