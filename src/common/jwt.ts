import jwt from 'jsonwebtoken';

import { Config } from './config';
import { IUser } from '../http-api/controller/user/auth';

export const jwtUtils = {
  generateToken(user: IUser): string {
    return jwt.sign(user, Config.JWT_SECRET_KEY);
  },

  verifyToken(token?: string): boolean {
    if (!token) return false;

    try {
      const verified = jwt.verify(token, Config.JWT_SECRET_KEY);
      return verified ? true : false;
    } catch (error) {
      return false;
    }
  },
};
