import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Observable, throwError, catchError, timeout } from 'rxjs';
import { GraphQLException } from 'src/graphql/errors/GraphQLError';
import { ApolloServerErrorCode } from 'src/graphql/errors/error-codes';
@Injectable()
export class ErrorHandlingInterceptor implements NestInterceptor {
  private errorCodesStatusMapping = {
    P2000: ApolloServerErrorCode.BAD_REQUEST,
    P2002: ApolloServerErrorCode.CONFLICT,
    P2025: ApolloServerErrorCode.NOT_FOUND,
  };

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      timeout({
        each: 1000,
        with: () =>
          throwError(
            () =>
              new GraphQLException(
                'API Timeout',
                ApolloServerErrorCode.REQUEST_TIMEOUT,
              ),
          ),
      }),
      catchError((err) => {
        // handle errors here => try to convert to graphql error
        if (err instanceof PrismaClientKnownRequestError) {
          return throwError(() => this.convertPrismaClientError(err));
        }

        if (err instanceof GraphQLException) {
          return throwError(() => err);
        }

        return throwError(() => this.convertCommonError(err));
      }),
    );
  }

  private convertPrismaClientError(exception: PrismaClientKnownRequestError) {
    const statusCode = this.errorCodesStatusMapping[exception.code];
    let message: string;

    if (!statusCode) {
      return this.convertCommonError(exception);
    }

    if (exception.code === 'P2002') {
      // Handling Unique Key Constraint Violation Error
      const fields = (exception.meta as { target: string[] }).target;
      message = `Another record with the requested (${fields.join(
        ', ',
      )}) already exists`;
    } else {
      message =
        `[${exception.code}]: ` + this.exceptionShortMessage(exception.message);
    }

    return new GraphQLException(message, statusCode);
  }

  private convertCommonError(err: any) {
    return new GraphQLException(
      err.message || err.msg || 'Internal server error',
      err.code || err.status || ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
    );
  }

  private exceptionShortMessage(message: string): string {
    const shortMessage = message.substring(message.indexOf('→'));
    return shortMessage
      .substring(shortMessage.indexOf('\n'))
      .replace(/\n/g, '')
      .trim();
  }
}
