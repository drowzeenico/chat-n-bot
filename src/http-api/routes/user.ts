import express from 'express';
import { buildHttpErrorResponse, buildHttpResponse } from '../response';
import { BaseError } from '../../errors';
import { IUser, UserAuthController } from '../controller/user/auth';
import { UserRegisterController } from '../controller/user/register';

const UsersRouter = express.Router();

UsersRouter.post('/auth', async (req, res) => {
  try {
    const result = await UserAuthController(req.body);
    res.json(buildHttpResponse<string>(result));
  } catch (e) {
    res.status((e as BaseError).httpCode).json(buildHttpErrorResponse(e as BaseError));
  }
});

UsersRouter.post('/register', async (req, res) => {
  try {
    const result = await UserRegisterController(req.body);
    res.json(buildHttpResponse<IUser>(result));
  } catch (e) {
    res.status((e as BaseError).httpCode).json(buildHttpErrorResponse(e as BaseError));
  }
});

export default UsersRouter;
