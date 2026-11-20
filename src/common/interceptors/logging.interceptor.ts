import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const { method, originalUrl } = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const start = Date.now();

    // 'finish' fires after the exception filter too, so the status is always the real one.
    response.once('finish', () => {
      this.logger.log(
        `${method} ${originalUrl} ${response.statusCode} - ${Date.now() - start}ms`,
      );
    });

    return next.handle();
  }
}
