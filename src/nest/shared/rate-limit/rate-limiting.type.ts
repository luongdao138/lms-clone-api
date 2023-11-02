import { TimeUnit } from 'src/types/common';

export interface BucketOptions {
  increment?: boolean;
  timeUnit: TimeUnit;
  timeLimit?: number;
  accessLimit: number;
  incrementPerAccess?: number;
}
