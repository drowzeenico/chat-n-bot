import express from "express";
import { buildHttpErrorResponse, buildHttpResponse } from "../response";
import { AppError, BaseError } from "../../errors";
import { ChatController } from "../controllers/chat";
import { chatDTO } from "../../models/chat";
import { QueryFailedError } from "typeorm";

const ChatRouter = express.Router();

ChatRouter.post("/", async (req, res) => {
  try {
    const result = await ChatController.create(req.user.id, req.body);
    res.json(buildHttpResponse<chatDTO>(result));
  } catch (e) {
    processErrors(res, e, req.body.name);
  }
});

ChatRouter.put("/:id", async (req, res) => {
  try {
    const result = await ChatController.update(req.user.id, {
      ...req.body,
      chatId: +req.params.id,
    });
    res.json(buildHttpResponse<chatDTO>(result));
  } catch (e) {
    processErrors(res, e, req.body.name);
  }
});

ChatRouter.delete("/:id", async (req, res) => {
  try {
    const result = await ChatController.remove(req.user.id, +req.params.id);
    res.json(buildHttpResponse<chatDTO>(result));
  } catch (e) {
    processErrors(res, e);
  }
});

export default ChatRouter;

const processErrors = (res: express.Response, e: unknown, name?: string) => {
  let error: BaseError;
  if (e instanceof BaseError) {
    error = e;
  } else if (e instanceof QueryFailedError) {
    if (e.message.includes("Unique_Name")) {
      error = new AppError(`Chat with selected name "${name}" already exists`);
    } else {
      error = new AppError("SQL error, see logs");
    }
  } else {
    error = new AppError("Server error", (e as Error).message);
  }

  res.status(error.httpCode).json(buildHttpErrorResponse(error));
};
