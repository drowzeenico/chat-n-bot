import http from 'http';
import { stringify } from 'querystring';

import { Config } from '../common/config';
import { IHttpErrorResponse, IHttpSuccessResponse } from '../http-api/response';
import { UserDto } from '../models/user';

export class HttpAPI {
  constructor() {}

  async auth(login: string, pass: string) {
    return (await this.request('POST', '/users/auth', {
      login: login,
      password: pass,
    })) as IHttpSuccessResponse<string> | IHttpErrorResponse;
  }

  async reqistration(login: string, pass: string, email: string) {
    return (await this.request('POST', '/users/register', {
      login: login,
      password: pass,
      email: email,
    })) as IHttpSuccessResponse<UserDto> | IHttpErrorResponse;
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
}
