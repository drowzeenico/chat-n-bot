import Joi from '@hapi/joi';
import { BadRequestError } from '../../errors';
import { ICommand } from './router';

export interface PingPayload {
  time: number;
}

export interface PingResponse {
  server_time: number;
  time_diff: number;
}

const commandValidationRule = Joi.object({
  time: Joi.date().timestamp('javascript').required(),
});

export const PingCommand: ICommand<PingPayload, PingResponse> = {
  name: 'ping',

  async process(payload: PingPayload): Promise<PingResponse> {
    const { error } = commandValidationRule.validate(payload);
    if (error) throw new BadRequestError(error.message, error);

    const serverTime = new Date().getTime();
    return {
      server_time: serverTime,
      time_diff: serverTime - payload.time,
    };
  },
};
