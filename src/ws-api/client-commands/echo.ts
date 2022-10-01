import Joi from '@hapi/joi';
import { BadRequestError } from '../../errors';
import { ICommand } from './router';

export interface EchoPayload {
  data: string;
}

export interface EchoResponse {
  response: string;
}

const commandValidationRule = Joi.object({
  data: Joi.string().required(),
});

export const EchoCommand: ICommand<EchoPayload, EchoResponse> = {
  name: 'echo',

  async process(payload: EchoPayload): Promise<EchoResponse> {
    const { error } = commandValidationRule.validate(payload);
    if (error) throw new BadRequestError(error.message, error);

    return {
      response: payload.data,
    };
  },
};
