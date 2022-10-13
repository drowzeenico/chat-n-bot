import { IncomingMessage, Server } from 'http';
import { Socket } from 'net';
import { URL } from 'url';

import { Config } from '../common/config';
import { Logger } from '../common/logger';
import { wsServer } from './server';
import { Connection } from './connection';
import { jwtUtils, VerifiedToken } from '../common/jwt';
import { AccessDenied, BaseError } from '../errors';
import { WebSocket } from 'ws';
import { UserService } from '../services/user';

const logger = Logger('WS-Server');

export interface IParsedRequest {
  requestStartAt: number;
  verison: number;
  token?: string;
  ip?: string;
}

export class WssLauncher {
  private wss: wsServer;

  constructor(private _httpServer: Server) {
    this.wss = new wsServer({ noServer: true, clientTracking: true });
    this._httpServer.on('upgrade', this._upgrade.bind(this));
    logger.info('Ws-server has been started at %s', Config.WSAPI);
  }

  private async _upgrade(req: IncomingMessage, socket: Socket, head: Buffer) {
    const parsed = this._parseRequest(req, socket);

    this.wss.handleUpgrade(req, socket, head, async _ws => {
      const jwt = jwtUtils.parseToken(parsed.token ?? '');
      if (!jwt) {
        return this.sendError(new AccessDenied('Access denied: User is not authorized'), _ws);
      }

      const user = await UserService.getUserById((jwt as VerifiedToken).userId);
      if (!user) {
        return this.sendError(new AccessDenied('Access denied: User is not found'), _ws);
      }

      const ws = new Connection(_ws, parsed, user);
      this.wss.emit('connection', ws, req);
    });
  }

  private sendError(err: BaseError, ws: WebSocket) {
    const response = this.wss.buildError(err);
    ws.send(JSON.stringify(response));
    return ws.close(1002, err.message);
  }

  private _parseRequest(req: IncomingMessage, socket: Socket): IParsedRequest {
    const forwarded = String(req.headers['x-forwarded-for'] || '')
      .split(',')
      .pop()
      ?.trim();

    const url = new URL(req.url ?? '', Config.WSAPI);
    return {
      requestStartAt: Number(req.headers['x-request-start']) || Date.now(),
      verison: Number(url.searchParams.get('version')),
      token: url.searchParams.get('token') ?? undefined,
      ip: forwarded || req.socket.remoteAddress || socket.remoteAddress,
    };
  }

  private _terminate(socket: Socket) {
    if (socket.writable) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    }
    socket.destroy();
  }
}
