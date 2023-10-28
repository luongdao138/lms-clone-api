export function splitEnv<T = any>(env?: string) {
  if (!env) return [];

  return env.split(',') as T;
}
