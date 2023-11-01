import { GraphQLError } from 'graphql';
import { ApolloServerErrorCode } from './error-codes';

export class GraphQLException extends GraphQLError {
  constructor(message: string, code?: ApolloServerErrorCode) {
    if (!Object.values(ApolloServerErrorCode).includes(code)) {
      code = ApolloServerErrorCode.INTERNAL_SERVER_ERROR;
    }

    super(message, {
      extensions: { code, timestamp: new Date() },
    });
  }
}
