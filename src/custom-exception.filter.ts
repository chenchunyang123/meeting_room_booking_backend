import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class CustomExceptionFilter<T> implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const res = exception.getResponse() as { message: string[] | string };

    response
      .json({
        code: exception.getStatus(),
        message: 'fail',
        data: Array.isArray(res?.message)
          ? res.message.join(',')
          : res?.message || exception.message,
      })
      .end();
  }
}
