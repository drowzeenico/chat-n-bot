import Joi from '@hapi/joi';
import { BadRequestError, ResourceNotFound } from '../../../errors';
import { jwtUtils } from '../../../common/jwt';

export interface IUser {
  login: string;
  password: string;
}

type UserCredentials = {
  login: string;
  password: string;
};

export const UserAuthController = async (credentials: UserCredentials): Promise<string> => {
  const validationRules = Joi.object({
    login: Joi.string().required(),
    password: Joi.string().required(),
  }).required();

  const { error } = validationRules.validate(credentials);
  if (error) throw new BadRequestError('Validation error:' + error.message);

  for (const u of global.Users) {
    if (u.login === credentials.login && u.password === credentials.password) {
      return jwtUtils.generateToken(u);
    }
  }

  throw new ResourceNotFound("User hasn't been found");
};
