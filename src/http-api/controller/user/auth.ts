import Joi from '@hapi/joi';
import { BadRequestError, ResourceNotFound } from '../../../errors';
import { jwtUtils } from '../../../common/jwt';
import Database from '../../../common/db';
import { User } from '../../../models/user';
import { UserService } from '../../../services/users';

type UserCredentials = {
  login: string;
  password: string;
};

export const UserAuthController = async (access: UserCredentials): Promise<string> => {
  const validationRules = Joi.object({
    login: Joi.string().required(),
    password: Joi.string().required(),
  }).required();

  const { error } = validationRules.validate(access);
  if (error) throw new BadRequestError('Validation error:' + error.message);

  const user = await Database.getRepository(User).findOne({
    where: {
      login: access.login,
      password: UserService.hashPassword(access.password),
    },
  });

  if (!user) throw new ResourceNotFound("User hasn't been found");

  return jwtUtils.generateToken({ userId: user!.id });
};
