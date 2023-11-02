import { Observable } from 'rxjs';
import {
  NestInterceptor,
  Injectable,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { prettifyToLog } from 'src/utils/log-helper';

// Logging information only for GraphQL
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger(LoggingInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    if (context.getType<GqlContextType>() !== 'graphql') return next.handle();

    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();

    const operation = info.parentType?.name || info.path?.typename;
    const fieldName = info.fieldName || info.key;
    const returnType = info.returnType?.ofType?.name;
    const args = gqlContext.getArgs();

    this.logger.log(
      `GraphQL operation >> ${operation} >> ${fieldName} >> ${returnType}`,
    );
    if (args) {
      this.logger.log(prettifyToLog(args));
    }

    return next.handle();
  }
}
