import express from 'express';
import { buildHttpErrorResponse, buildHttpResponse } from '../response';
import { BaseError } from '../../errors';
import { ChatController } from '../controllers/chat';
import { Chat } from '../../models/chat';

const ChatRouter = express.Router();

ChatRouter.post('/', async (req, res) => {
  try {
    const result = await ChatController.create(req.user.id, req.body.name);
    res.json(buildHttpResponse<Chat>(result));
  } catch (e) {
    res.status((e as BaseError).httpCode).json(buildHttpErrorResponse(e as BaseError));
  }
});

ChatRouter.put('/:id', async (req, res) => {
  try {
    const result = await ChatController.update(req.user.id, {
      name: req.body.name,
      chatId: +req.params.id,
    });
    res.json(buildHttpResponse<Chat>(result));
  } catch (e) {
    res.status((e as BaseError).httpCode).json(buildHttpErrorResponse(e as BaseError));
  }
});

ChatRouter.delete('/:id', async (req, res) => {
  try {
    const result = await ChatController.remove(req.user.id, +req.params.id);
    res.json(buildHttpResponse<Chat>(result));
  } catch (e) {
    res.status((e as BaseError).httpCode).json(buildHttpErrorResponse(e as BaseError));
  }
});

export default ChatRouter;
