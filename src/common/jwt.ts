import jwt, { JwtPayload } from 'jsonwebtoken';

import { Config } from './config';

type JwtData = { userId: number };
export type VerifiedToken = JwtPayload & JwtData;

export const jwtUtils = {
  generateToken(user: JwtData): string {
    return jwt.sign(user, Config.JWT_SECRET_KEY);
  },

  parseToken(token: string): boolean | VerifiedToken {
    try {
      const verified = jwt.verify(token, Config.JWT_SECRET_KEY);
      return !verified ? false : (verified as VerifiedToken);
    } catch (error) {
      return false;
    }
  },
};
