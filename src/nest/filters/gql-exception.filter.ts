import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { ApolloError } from 'apollo-server-express';
import { Request } from 'express';
import { Environment, NodeEnv } from 'src/constants/env';
import { GqlContext } from 'src/types/common';

export type RequestData = {
  query: string;
  hostname: string;
  ip: string;
  userId: number;
};

export class InternalServerError extends ApolloError {
  constructor() {
    super('Internal server error');
  }
}

interface RequestWithUser extends Request {
  user: { id: number } | null;
}

export function createRequestData(req: RequestWithUser): RequestData {
  const user = req.user;
  return {
    query: req.body?.query,
    hostname: req.hostname,
    ip: req.ip,
    userId: user?.id,
  };
}

@Catch()
export class GqlResolverExceptionsFilter implements GqlExceptionFilter {
  constructor(private configService: ConfigService) {}

  private logger = new Logger(GqlResolverExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const requestData = this.prepareRequestData(host);

    let clientError: Error;

    if (exception instanceof HttpException) {
      clientError = exception;
      this.logger.error(clientError.message, { requestData });
    } else {
      exception.requestData = requestData;
      this.logger.error(exception.message, exception);
      clientError =
        this.configService.get(Environment.NODE_ENV) === NodeEnv.Production
          ? new InternalServerError()
          : new ApolloError(exception.message);
    }

    return clientError;
  }

  private prepareRequestData(host: ArgumentsHost) {
    const context = GqlArgumentsHost.create(host).getContext<GqlContext>();

    return context.req ? createRequestData(context.req) : null;
  }
}
