import http from 'http';
import { stringify } from 'querystring';

import { Config } from '../common/config';
import { IHttpErrorResponse, IHttpSuccessResponse } from '../http-api/response';
import { UserDto } from '../models/user';
import { UserTypes } from '../types/user';

export class HttpAPI {
  constructor() {}

  async auth(credentials: UserTypes.Credentials) {
    return (await this.request('POST', '/users/auth', credentials)) as IHttpSuccessResponse<string> | IHttpErrorResponse;
  }

  async reqistration(regData: UserTypes.RegistrationData) {
    return (await this.request('POST', '/users/register', regData)) as IHttpSuccessResponse<UserDto> | IHttpErrorResponse;
  }

  private request(method: 'GET' | 'POST', url: string, payload?: any) {
    const options: http.ClientRequestArgs = {
      hostname: Config.HTTP_API_URL,
      port: Config.PORT,
      path: url,
      method: method,
    };

    let body: string;
    if (payload) {
      body = stringify(payload);
      options.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      };
    }

    return new Promise((res, rej) => {
      const req = http
        .request(options, resp => {
          let data = '';

          resp.on('data', chunk => {
            data += chunk;
          });

          resp.on('end', () => {
            res(JSON.parse(data));
          });
        })
        .on('error', err => {
          rej(err);
        });

      req.write(body);
      req.end();
    });
  }

  async getAnswer(message: string) {
    const query = { bid: '178', key: 'sX5A2PcYZbsN5EY6', uid: 'mashape', msg: message };

    const options: http.ClientRequestArgs = {
      hostname: 'https://acobot-brainshop-ai-v1.p.rapidapi.com',
      path: '/get?' + stringify(query),
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'a55d899c68mshd4c6ad8015251b8p156543jsn9a9bc44c4680',
        'X-RapidAPI-Host': 'acobot-brainshop-ai-v1.p.rapidapi.com',
      },
    };

    return new Promise((res, rej) => {
      http
        .request(options, resp => {
          let data = '';

          resp.on('data', chunk => {
            data += chunk;
          });

          resp.on('end', () => {
            res(JSON.parse(data));
          });
        })
        .on('error', err => {
          rej(err);
        });
    });
  }
}
