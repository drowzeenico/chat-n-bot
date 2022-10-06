import { BaseError, DEFAULT_HTTP_ERROR_CODE, ErrorCode } from '../errors';

export interface IHttpSuccessResponse<T> {
  response: T;
  success: true;
  httpCode: number;
}

export interface IHttpErrorResponse {
  error: {
    message: string;
    object: Error;
  };
  success: false;
  httpCode: number;
}

export const buildHttpResponse = <T>(response: T, httpCode: number = 200): IHttpSuccessResponse<T> => {
  return {
    success: true,
    response,
    httpCode,
  };
};

export const buildHttpErrorResponse = (err: Error): IHttpErrorResponse => {
  const isBaseError = err instanceof BaseError;

  const response: IHttpErrorResponse = {
    success: false,
    error: {
      message: err.message,
      object: err,
    },
    httpCode: isBaseError ? err.httpCode : DEFAULT_HTTP_ERROR_CODE,
  };

  return response;
};
