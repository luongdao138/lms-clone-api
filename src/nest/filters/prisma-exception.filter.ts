import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpServer,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

export type ErrorCodesStatusMapping = {
  [key: string]: number;
};

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  private errorCodesStatusMapping: ErrorCodesStatusMapping = {
    P2000: HttpStatus.BAD_REQUEST,
    P2002: HttpStatus.CONFLICT,
    P2025: HttpStatus.NOT_FOUND,
  };

  constructor(applicationRef?: HttpServer) {
    super(applicationRef);
  }

  catch(exception: any, host: ArgumentsHost) {
    const statusCode = this.errorCodesStatusMapping[exception.code];
    let message: string;

    if (!statusCode) {
      return super.catch(exception, host);
    }

    if (host.getType() === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      if (exception.code === 'P2002') {
        // Handling Unique Key Constraint Violation Error
        const fields = (exception.meta as { target: string[] }).target;
        message = `Another record with the requested (${fields.join(
          ', ',
        )}) already exists`;
      } else {
        message =
          `[${exception.code}]: ` +
          this.exceptionShortMessage(exception.message);
      }

      const errorResponse = {
        message,
        statusCode,
      };

      response.status(statusCode).send(errorResponse);
    }

    return new HttpException({ statusCode, message }, statusCode);
  }

  exceptionShortMessage(message: string): string {
    const shortMessage = message.substring(message.indexOf('→'));
    return shortMessage
      .substring(shortMessage.indexOf('\n'))
      .replace(/\n/g, '')
      .trim();
  }
}
