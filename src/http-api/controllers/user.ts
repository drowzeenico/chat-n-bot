import Joi from "@hapi/joi";
import { BadRequestError, ResourceNotFound, AppError } from "../../errors";
import { jwtUtils } from "../../common/jwt";
import Database from "../../common/db";
import { User } from "../../models/user";
import { UserService, UserServices } from "../../services/user";
import { UserDto } from "../../models/user";

type UserCredentials = {
  login: string;
  password: string;
};

export type RegistrationData = {
  login: string;
  password: string;
  email: string;
};

export const UserController = {
  async auth(access: UserCredentials): Promise<string> {
    const validationRules = Joi.object({
      login: Joi.string().required(),
      password: Joi.string().required(),
    }).required();

    const { error } = validationRules.validate(access);
    if (error) throw new BadRequestError("Validation error:" + error.message);

    const user = await Database.getRepository(User).findOne({
      where: {
        login: access.login,
        password: UserServices.hashPassword(access.password),
      },
    });

    if (!user) throw new ResourceNotFound("User hasn't been found");

    return jwtUtils.generateToken({ userId: user!.id });
  },

  async register(credentials: RegistrationData): Promise<UserDto> {
    const validationRules = Joi.object({
      login: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }).required();

    const { error } = validationRules.validate(credentials);
    if (error) throw new BadRequestError("Validation error:" + error.message);

    try {
      const user = await UserService.save(credentials);
      if (!user) {
        throw new AppError("Error occured while registering new user");
      }

      return user!.DTO;
    } catch (e) {
      throw new AppError("Error occured while registering new user", {
        message: (e as Error).message,
      });
    }
  },
};
