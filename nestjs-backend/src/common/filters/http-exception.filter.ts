import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: any = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && 'error' in exceptionResponse) {
        // BusinessException format
        error = (exceptionResponse as any).error;
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = { code: 'HTTP_EXCEPTION', message };
      } else if (typeof exceptionResponse === 'object') {
        error = exceptionResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = { code: 'INTERNAL_ERROR', message, stack: exception.stack };
      console.error('Internal Error:', exception);
    }

    response.status(status).json({
      success: false,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
    });
  }
}
