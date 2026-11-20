import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '../../generated/prisma/client.js';

interface ErrorBody {
  statusCode: number;
  code: string;
  message: string | string[];
}

/** Database errors we expect, translated into friendly HTTP errors. */
const PRISMA_ERRORS: Record<string, ErrorBody> = {
  P2002: {
    statusCode: HttpStatus.CONFLICT,
    code: 'UNIQUE_CONSTRAINT_VIOLATION',
    message:
      'A record with this value already exists (movie titles and cinema names must be unique).',
  },
  P2025: {
    statusCode: HttpStatus.NOT_FOUND,
    code: 'NOT_FOUND',
    message: 'Record not found.',
  },
  P2034: {
    statusCode: HttpStatus.CONFLICT,
    code: 'TRANSACTION_CONFLICT',
    message:
      'The record was changed by another request at the same time. Please retry.',
  },
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const body = this.toErrorBody(exception);

    if (body.statusCode >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.stack : exception,
      );
    }

    http
      .getResponse<Response>()
      .status(body.statusCode)
      .json({
        ...body,
        path: http.getRequest<Request>().url,
        timestamp: new Date().toISOString(),
      });
  }

  private toErrorBody(exception: unknown): ErrorBody {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const response = exception.getResponse();
      const { code, message } = (
        typeof response === 'string' ? { message: response } : response
      ) as { code?: string; message?: string | string[] };

      return {
        statusCode,
        code: code ?? HttpStatus[statusCode] ?? 'ERROR',
        message: message ?? exception.message,
      };
    }

    if (
      exception instanceof Prisma.PrismaClientKnownRequestError &&
      PRISMA_ERRORS[exception.code]
    ) {
      return PRISMA_ERRORS[exception.code];
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred.',
    };
  }
}
