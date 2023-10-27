import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ExtractJwt } from 'passport-jwt';

export function getToken(context: ExecutionContext) {
  const gqlExecutionContext = GqlExecutionContext.create(context);
  const req = gqlExecutionContext.getContext().req;

  const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
  return token;
}

export const AuthToken = createParamDecorator(
  (data, context: ExecutionContext) => {
    return getToken(context);
  },
);
