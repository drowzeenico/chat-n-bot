import Joi from '@hapi/joi';
import WebSocket, { ServerOptions } from 'ws';

import { Client } from './connection';
import { Logger } from '../common/logger';
import { ResourceNotFound, UnsupportedCommandFormatError } from '../errors';
import { IPayload, IResponse, Router } from './client-commands/router';

const logger = Logger('WebSocket-Server');

export interface IClientMessage {
  name: string;
  payload: IPayload;
}

export interface IClientMessageResult {
  command?: string;
  result?: IResponse | null;
  error?: {
    message: string;
    object: Error;
  };
  success: boolean;
}

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

  onConnection(client: Client) {
    const logInfo = `Connected id=${client.id}, readyState=${client.ws.readyState}`;
    logger.info(logInfo);
    client.connected(logInfo);

    client.ws.on('message', async data => {
      try {
        const command: IClientMessage = JSON.parse(data.toString());
        const validateError = this.validateCommand(command);
        if (validateError) {
          const err = this.buildErrorResponse(validateError, command);
          return client.json(err);
        }

        const result = await this.processMessage(command, client);
        if (result instanceof Error) {
          const err = this.buildErrorResponse(result, command);
          return client.json(err);
        }

        const response = this.buildResponse(result, command);
        client.json(response);
      } catch (e) {
        client.json(this.buildErrorResponse(e as Error));
      }
    });

    client.ws.on('close', (code, reason) => {
      logger.info('client disconnected', { code, reason });
    });
  }

  validateCommand(command: IClientMessage): Error | void {
    const { error, value } = this.commandValidationRule.validate(command);

    if (error || !value) {
      return new UnsupportedCommandFormatError(`Unsupported format: ${error!.message}`);
    }

    if (!Router.has(command.name)) {
      return new ResourceNotFound("Command doesn't exist");
    }
  }

  async processMessage(command: IClientMessage, client: Client): Promise<IResponse | Error> {
    try {
      const controller = Router.get(command.name)!;
      return await controller(command, client);
    } catch (e) {
      return e as Error;
    }
  }

  buildResponse(res: IResponse, cmd: IClientMessage): IClientMessageResult {
    return {
      command: cmd.name,
      success: true,
      result: res,
    };
  }

  buildErrorResponse(err: Error, cmd?: IClientMessage): IClientMessageResult {
    const response: IClientMessageResult = {
      success: false,
      error: {
        message: err.message,
        object: err,
      },
    };
    if (cmd) {
      response.command = cmd.name;
    }

    return response;
  }
}
