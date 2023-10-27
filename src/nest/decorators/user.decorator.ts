import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/graphql/models/User';

export function getUser(executionContext: ExecutionContext): User {
  const gqlExecutionContext = GqlExecutionContext.create(executionContext);
  return gqlExecutionContext.getContext().req.user;
}

export const AuthUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    return getUser(context);
  },
);
