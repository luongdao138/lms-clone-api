import * as Joi from 'joi';
import { Environment, NodeEnv } from 'src/constants/env';

export const envValidatorSchema = Joi.object({
  [Environment.NODE_ENV]: Joi.valid(...Object.values(NodeEnv)).default(
    'development',
  ),
  [Environment.PORT]: Joi.number().optional().default(2960),
  [Environment.DATABASE_URL]: Joi.string().required(),
  [Environment.REDIS_HOST]: Joi.string().required(),
  [Environment.REDIS_PORT]: Joi.string().required(),
  [Environment.RABBITMQ_URL]: Joi.string().required(),
  [Environment.EMAIL_FROM]: Joi.string().required(),
  [Environment.EMAIL_HOST]: Joi.string().required(),
  [Environment.EMAIL_PASS]: Joi.string().required(),
  [Environment.EMAIL_USER]: Joi.string().required(),
});

export const validationOptions = {
  allowUnknown: true,
  abortEarly: true,
};
