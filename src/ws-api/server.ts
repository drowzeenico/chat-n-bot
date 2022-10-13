import Joi from '@hapi/joi';
import WebSocket, { ServerOptions } from 'ws';

import { Connection } from './connection';
import { Logger } from '../common/logger';
import { ResourceNotFound, UnsupportedCommandFormatError } from '../errors';
import { Router } from './client-commands/router';
import { Client } from './client-commands/types/client';

const logger = Logger('WebSocket-Server');

export class wsServer extends WebSocket.Server {
  private commandValidationRule: Joi.ObjectSchema<any>;

  constructor(options?: ServerOptions) {
    super(options);

    this.on('connection', this.onConnection.bind(this));

    this.commandValidationRule = Joi.object({
      name: Joi.string().required(),
      payload: Joi.object().required(),
    }).required();
  }

  onConnection(client: Connection) {
    const logInfo = `Connected id=${client.id}, readyState=${client.ws.readyState}`;
    logger.info(logInfo);
    client.connected();

    client.ws.on('message', async data => {
      try {
        const command: Client.Message = JSON.parse(data.toString());
        const { error, value } = this.commandValidationRule.validate(command);

        if (error || !value) {
          const e = new UnsupportedCommandFormatError(`Unsupported format: ${error!.message}`);
          return client.json(this.buildError(e, command));
        }

        if (!Router.has(command.name)) {
          const e = new ResourceNotFound("Command doesn't exist");
          return client.json(this.buildError(e, command));
        }

        try {
          const controller = Router.get(command.name)!;
          await controller(command, client);
        } catch (e) {
          return client.json(this.buildError(e as Error, command));
        }
      } catch (e) {
        client.json(this.buildError(e as Error));
      }
    });

    client.ws.on('close', (code, reason) => {
      client.disconnect();
      logger.info('client disconnected', { code, reason });
    });
  }

  buildError(err: Error, cmd?: Client.Message): Client.ErrorResponse {
    return {
      command: cmd?.name,
      success: false,
      error: {
        message: err.message,
        object: err,
      },
    };
  }
}
