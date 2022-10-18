import { Config } from '../common/config';
import { client } from 'websocket';
import { stringify } from 'querystring';

import { Logger } from '../common/logger';
import { HttpAPI } from './http-api';

const user = new client();
const logger = Logger('Client');

const connect = async () => {
  const http = new HttpAPI();
  const res = await http.auth('nicota', 'unreal');
  if (!res.success) {
    throw res.error;
  }

  const token = res.response;
  const ws_api = [Config.WSAPI, stringify({ token })].join('?');
  user.connect(ws_api);

  user.on('connectFailed', error => {
    logger.error('Connect Error: ' + error.toString());
  });

  user.on('connect', connection => {
    logger.info('WebSocket Client Connected');

    connection.on('error', error => {
      logger.error('Connection Error: ' + error.toString());
    });

    connection.on('close', () => {
      logger.warn('Connection Closed');
    });

    connection.on('message', message => {
      if (message.type === 'utf8') {
        logger.info("Received: '" + message.utf8Data + "'");
      }
    });
  });
};

connect();
