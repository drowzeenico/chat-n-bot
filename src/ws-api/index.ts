import { IncomingMessage, Server } from 'http';
import { Socket } from 'net';
import { URL } from 'url';

import { Config } from '../common/config';
import { Logger } from '../common/logger';
import { wsServer } from './server';
import { Client } from './connection';
import { jwtUtils } from '../common/jwt';
import { AccessDenied } from '../errors';

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

    this.wss.handleUpgrade(req, socket, head, _ws => {
      if (!jwtUtils.verifyToken(parsed.token ?? '')) {
        const errObject = new AccessDenied('User is not authorized');
        const err = this.wss.buildErrorResponse(errObject);
        _ws.send(JSON.stringify(err));
        return _ws.close(1002, errObject.message);
      }

      const ws = new Client(_ws, parsed);
      this.wss.emit('connection', ws, req);
    });
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
