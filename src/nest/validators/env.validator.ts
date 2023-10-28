import * as Joi from 'joi';
import { NodeEnv } from 'src/constants/env';

export const envValidatorSchema = Joi.object({
  NODE_ENV: Joi.valid(...Object.values(NodeEnv)).default('development'),
  PORT: Joi.number().optional().default(2960),
  DATABASE_URL: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.string().required(),
});

export const validationOptions = {
  allowUnknown: true,
  abortEarly: true,
};
