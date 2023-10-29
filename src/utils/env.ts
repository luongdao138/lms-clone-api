import { NodeEnv } from 'src/constants/env';

export const isDev = process.env.NODE_ENV === NodeEnv.Development;

export function splitEnv<T = any>(env?: string) {
  if (!env) return [];

  return env.split(',') as T;
}
