import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '@prisma/client';
import { GqlContext } from 'src/types/common';

export function getUser(executionContext: ExecutionContext): User {
  const gqlExecutionContext = GqlExecutionContext.create(executionContext);
  return gqlExecutionContext.getContext<GqlContext>().req.user;
}

export const AuthUser = createParamDecorator(
  (data, context: ExecutionContext) => {
    return getUser(context);
  },
);
