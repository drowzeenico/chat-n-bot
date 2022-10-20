import Joi from '@hapi/joi';
import { config } from 'dotenv';
import dotenvParseVariables from 'dotenv-parse-variables';
import { ConfigError } from '../errors';

export interface IConfig {
  ENV: string;
  HTTP_API_URL: string;
  PORT: number;
  REDIS: string;
  DB: {
    URL: string;
    USE_SSL: boolean;
    LOGGING: boolean;
  };
  WSAPI: string;
  JWT_SECRET_KEY: string;
  TOKEN_HEADER_KEY: string;
  SALT: string;
  AIAPI: {
    BRAIN_SHOP_BID: number;
    BRAIN_SHOP_KEY: string;
    BRAIN_SHOP_UID: 'mashape';
    RAPID_KEY: string;
    RAPID_HOST: string;
  };
}

let env = config({ path: process.env.DOTENV_CONFIG_PATH });
if (env.error || !env.parsed) throw env.error;

const parsed = dotenvParseVariables(env.parsed);

const configSchema = Joi.object({
  ENV: Joi.string().optional().valid('dev', 'test', 'stage', 'prod').default('dev'),
  HTTP_API_URL: Joi.string().required(),
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
  AIAPI: Joi.object({
    BRAIN_SHOP_BID: Joi.number().required(),
    BRAIN_SHOP_KEY: Joi.string().required(),
    BRAIN_SHOP_UID: Joi.string().default('mashape'),
    RAPID_KEY: Joi.string().required(),
    RAPID_HOST: Joi.string().uri().required(),
  }),
}).required();

const rawConfig: IConfig = {
  ENV: parsed.ENV as string,
  HTTP_API_URL: parsed.HTTP_API_URL as string,
  PORT: parsed.PORT as number,
  REDIS: parsed.REDIS as string,
  DB: {
    URL: parsed.DB_URL as string,
    USE_SSL: parsed.DB_USE_SSL as boolean,
    LOGGING: parsed.DB_LOGGING as boolean,
  },
  WSAPI: parsed.WSAPI as string,
  JWT_SECRET_KEY: parsed.JWT_SECRET_KEY as string,
  TOKEN_HEADER_KEY: parsed.TOKEN_HEADER_KEY as string,
  SALT: parsed.SALT as string,
  AIAPI: {
    BRAIN_SHOP_BID: parsed.BRAIN_SHOP_BID as number,
    BRAIN_SHOP_KEY: parsed.BRAIN_SHOP_KEY as string,
    BRAIN_SHOP_UID: 'mashape',
    RAPID_KEY: parsed.RAPID_KEY as string,
    RAPID_HOST: parsed.RAPID_HOST as string,
  },
};

const { error, value } = configSchema.validate(rawConfig, {
  allowUnknown: false,
});
if (error) {
  Promise.reject(new ConfigError(error.message, error));
}

export const Config = rawConfig;
