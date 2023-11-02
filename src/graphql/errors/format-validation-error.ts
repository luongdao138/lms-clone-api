import { ValidationError } from 'class-validator';
import { GraphQLException } from './GraphQLError';
import { ApolloServerErrorCode } from './error-codes';

export function classValidatorErrorsFactory(errors: ValidationError[]) {
  return new GraphQLException(
    Object.values(errors?.[0].children?.[0].constraints || {})?.[0] ??
      'Validation failed!',
    ApolloServerErrorCode.BAD_USER_INPUT,
  );
}
