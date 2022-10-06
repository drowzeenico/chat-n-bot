export const DEFAULT_HTTP_ERROR_CODE = 500;

export enum ErrorCode {
  BASE,
  NOT_FOUND,
  ACCESS_DENIED,
  CONFIG_MALFORMED,
  COMMAND_MALFORMED,
  PAYLOAD_MALFORMED,
  BUSINESS_LOGIC,
}

export interface IError {
  name: string;
  message: string;
  errorCode: ErrorCode;
  httpCode: number;
  payload?: Object;
}

export class BaseError extends Error implements IError {
  public errorCode: ErrorCode = ErrorCode.BASE;
  public httpCode: number = DEFAULT_HTTP_ERROR_CODE;
  public payload?: object;

  constructor(public message: string, payload?: Object) {
    super(message);
    this.message = message;
    this.name = this.constructor.name;
    this.payload = payload;
    Error.captureStackTrace(this);
  }
}

export class InternalError extends BaseError {
  constructor(error: Error) {
    super(error.message, error);
  }
}

export class ResourceNotFound extends BaseError {
  constructor(message: string, payload?: Object) {
    super(message, payload);
    this.errorCode = ErrorCode.NOT_FOUND;
    this.httpCode = 404;
  }
}

export class AccessDenied extends BaseError {
  constructor(message: string, payload?: Object) {
    super(message, payload);
    this.errorCode = ErrorCode.ACCESS_DENIED;
    this.httpCode = 403;
  }
}

export class ConfigError extends BaseError {
  constructor(message: string, payload?: Object) {
    super(message, payload);
    this.errorCode = ErrorCode.CONFIG_MALFORMED;
  }
}

export class UnsupportedCommandFormatError extends BaseError {
  constructor(message: string, payload?: Object) {
    super(message, payload);
    this.errorCode = ErrorCode.COMMAND_MALFORMED;
    this.httpCode = 400;
  }
}

export class BadRequestError extends BaseError {
  constructor(message: string, payload?: Object) {
    super(message, payload);
    this.errorCode = ErrorCode.PAYLOAD_MALFORMED;
    this.httpCode = 400;
  }
}

export class AppError extends BaseError {
  constructor(message: string, payload?: Object) {
    super(message, payload);
    this.errorCode = ErrorCode.BUSINESS_LOGIC;
    this.httpCode = 400;
  }
}
