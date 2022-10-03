import Joi from '@hapi/joi';
import { BadRequestError } from '../../errors';
import { Client } from '../connection';
import { ICommand } from './router';

export interface BroadcastPayload {
  data: string;
}

export interface BroadcastResponse {
  broadcasted: string;
}

const commandValidationRule = Joi.object({
  data: Joi.string().required(),
});

export const BroadcastCommand: ICommand<BroadcastPayload, BroadcastResponse> = {
  name: 'broadcast',

  async process(payload: BroadcastPayload, client: Client): Promise<BroadcastResponse> {
    const { error } = commandValidationRule.validate(payload);
    if (error) throw new BadRequestError(error.message, error);

    client.sendToAll({
      id: client.id,
      message: 'HELLO MESSAGE FROM ' + client.id,
    });

    return {
      broadcasted: payload.data,
    };
  },
};
