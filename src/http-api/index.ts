import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';

import UserRoutes from './routes/user';
import ChatRoutes from './routes/chat';
import { AccessDenied, BaseError, ResourceNotFound } from '../errors';
import { Logger } from '../common/logger';
import { jwtUtils, VerifiedToken } from '../common/jwt';
import { Config } from '../common/config';
import { buildHttpErrorResponse } from './response';
import { User } from '../models/user';
import { UserService } from '../services/user';

const logger = Logger('HTTP-Server');

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

export class HttpApi {
  private app: express.Application;

  constructor() {
    this.app = express();

    this.app.use(
      cors({
        origin: true,
        credentials: true,
        maxAge: 60 * 60 * 4, // 4 hours
      })
    );

    this.app.disable('x-powered-by');
    this.app.enable('trust proxy');
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(express.json());
  }

  get(): express.Application {
    this._setRoutes();
    this._setErrorHandlers();

    return this.app;
  }

  private _setRoutes(): void {
    this.app.use(async (req, res, next) => {
      const urlToIgnore = new Set<string>(['/', '/users/auth', '/users/register']);
      if (urlToIgnore.has(req.url)) return next();

      const token = req.headers[Config.TOKEN_HEADER_KEY] as string;

      const jwt = jwtUtils.parseToken(token);
      if (!jwt) {
        const err = new AccessDenied('Access denied');
        return res.status(err.httpCode).json(buildHttpErrorResponse(err));
      }

      const user = await UserService.getUserById((jwt as VerifiedToken).userId);
      if (!user) {
        const err = new AccessDenied('Access denied: User is not found');
        return res.status(err.httpCode).json(buildHttpErrorResponse(err));
      }

      req.user = user;

      next();
    });

    this.app.get('/', (req, res) => {
      res.send('Its chat-n-bot, sap :)');
    });

    this.app.use('/users', UserRoutes);
    this.app.use('/chat', ChatRoutes);

    this.app.use((req, res, next) => {
      next(new ResourceNotFound('Resourse not found'));
    });
  }

  private _setErrorHandlers(): void {
    this.app.use((e: Error, req: Request, res: Response, next: NextFunction) => {
      const error = buildHttpErrorResponse(e);

      logger.error('Request=%s %s, Error=%o', req.method, req.url, error, {
        label: e instanceof BaseError ? 'Base Error' : 'Error',
      });

      res.status(error.httpCode).json(error);
    });
  }
}
