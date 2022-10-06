import Joi from '@hapi/joi';
import { config } from 'dotenv';
import dotenvParseVariables from 'dotenv-parse-variables';
import { ConfigError } from '../errors';

export interface IConfig {
  ENV: string;
  PORT: string;
  REDIS: string;
  DB: {
    URL: string;
    USE_SSL: string;
    LOGGING: string;
  };
  WSAPI: string;
  JWT_SECRET_KEY: string;
  TOKEN_HEADER_KEY: string;
  SALT: string;
}

let env = config({ path: process.env.DOTENV_CONFIG_PATH });
if (env.error || !env.parsed) throw env.error;

const parsed = dotenvParseVariables(env.parsed);

const configSchema = Joi.object({
  ENV: Joi.string().optional().default('dev'),
  PORT: Joi.number().required().default(9000),
  REDIS: Joi.string().uri().required(),
  DB: Joi.object({
    URL: Joi.string().uri().required(),
    USE_SSL: Joi.boolean().optional().default(false),
    LOGGING: Joi.boolean().optional().default(false),
  }),
  WSAPI: Joi.string().uri().required(),
  JWT_SECRET_KEY: Joi.string().required(),
  TOKEN_HEADER_KEY: Joi.string().required(),
  SALT: Joi.string(),
}).required();

const rawConfig: IConfig = {
  ENV: parsed.ENV as string,
  PORT: parsed.PORT as string,
  REDIS: parsed.REDIS as string,
  DB: {
    URL: parsed.DB_URL as string,
    USE_SSL: parsed.DB_USE_SSL as string,
    LOGGING: parsed.DB_LOGGING as string,
  },
  WSAPI: parsed.WSAPI as string,
  JWT_SECRET_KEY: parsed.JWT_SECRET_KEY as string,
  TOKEN_HEADER_KEY: parsed.TOKEN_HEADER_KEY as string,
  SALT: parsed.SALT as string,
};

const { error, value } = configSchema.validate(rawConfig, {
  allowUnknown: false,
});
if (error) {
  throw new ConfigError(error.message, error);
}

export const Config = value;
