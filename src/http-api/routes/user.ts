import express from 'express';
import { buildHttpErrorResponse, buildHttpResponse } from '../response';
import { BaseError } from '../../errors';
import { UserController } from '../controllers/user';
import { UserDto } from '../../models/user';

const UsersRouter = express.Router();

UsersRouter.post('/auth', async (req, res) => {
  try {
    const result = await UserController.auth(req.body);
    res.json(buildHttpResponse<string>(result));
  } catch (e) {
    res.status((e as BaseError).httpCode).json(buildHttpErrorResponse(e as BaseError));
  }
});

UsersRouter.post('/register', async (req, res) => {
  try {
    const result = await UserController.register(req.body);
    res.json(buildHttpResponse<UserDto>(result));
  } catch (e) {
    res.status((e as BaseError).httpCode).json(buildHttpErrorResponse(e as BaseError));
  }
});

UsersRouter.get('/say-hi', async (req, res) => {
  try {
    const result = req.user.DTO;
    res.json(buildHttpResponse<UserDto>(result));
  } catch (e) {
    res.status((e as BaseError).httpCode).json(buildHttpErrorResponse(e as BaseError));
  }
});

export default UsersRouter;
