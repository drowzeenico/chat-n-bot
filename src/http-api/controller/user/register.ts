import Joi from '@hapi/joi';
import { AppError, BadRequestError } from '../../../errors';
import { UserDto } from '../../../models/user';
import { UserService } from '../../../services/users';

export type RegistrationData = {
  login: string;
  password: string;
  email: string;
};

export const UserRegisterController = async (credentials: RegistrationData): Promise<UserDto> => {
  const validationRules = Joi.object({
    login: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).required();

  const { error } = validationRules.validate(credentials);
  if (error) throw new BadRequestError('Validation error:' + error.message);

  try {
    const user = await UserService.save(credentials);
    if (!user) {
      throw new AppError('Error occured while registering new user');
    }

    return user!.getDTO();
  } catch (e) {
    throw new AppError('Error occured while registering new user', { message: (e as Error).message });
  }
};
