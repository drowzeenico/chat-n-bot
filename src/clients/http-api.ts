import http from 'http';
import { stringify } from 'querystring';

import { Config } from '../common/config';
import { IHttpErrorResponse, IHttpSuccessResponse } from '../http-api/response';
import { chatDTO } from '../models/chat';
import { UserDto } from '../models/user';
import { ChatTypes } from '../types/chat';
import { UserTypes } from '../types/user';

export class HttpAPI {
  constructor() {}

  async auth(credentials: UserTypes.Credentials) {
    return (await this.request('POST', '/users/auth', credentials)) as IHttpSuccessResponse<string> | IHttpErrorResponse;
  }

  async reqistration(regData: UserTypes.RegistrationData) {
    return (await this.request('POST', '/users/register', regData)) as IHttpSuccessResponse<UserDto> | IHttpErrorResponse;
  }

  async createChat(data: ChatTypes.CreatePayload) {
    return (await this.request('POST', '/chat', data)) as IHttpSuccessResponse<chatDTO> | IHttpErrorResponse;
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
    const query = { bid: Config.AIAPI.BRAIN_SHOP_BID, key: Config.AIAPI.BRAIN_SHOP_KEY, uid: Config.AIAPI.BRAIN_SHOP_UID, msg: message };

    const options: http.ClientRequestArgs = {
      hostname: Config.AIAPI.RAPID_HOST,
      path: '/get?' + stringify(query),
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': Config.AIAPI.RAPID_KEY,
        'X-RapidAPI-Host': Config.AIAPI.RAPID_HOST.replace('http://', ''),
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
