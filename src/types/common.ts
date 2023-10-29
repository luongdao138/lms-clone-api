import { Request } from 'express';
import { User } from 'src/graphql/models/User';

export interface GqlContext {
  req: Request & { user: User };
}
