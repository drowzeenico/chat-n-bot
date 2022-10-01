import Joi from '@hapi/joi';
import { BadRequestError, LogicError } from '../../../errors';
import { IUser } from './auth';

global.Users = new Set<IUser>();

type UserCredentials = {
  login: string;
  password: string;
};

export const UserRegisterController = async (credentials: UserCredentials): Promise<IUser> => {
  const validationRules = Joi.object({
    login: Joi.string().required(),
    password: Joi.string().required(),
  }).required();

  const { error } = validationRules.validate(credentials);
  if (error) throw new BadRequestError('Validation error:' + error.message);

  const newUser = {
    login: credentials.login,
    password: credentials.password,
  };

  for (const u of global.Users) {
    if (newUser.login === u.login && newUser.password === u.password) {
      throw new LogicError('User already exists');
    }
  }

  global.Users.add(newUser);
  return newUser;
};
