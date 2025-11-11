import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { DomainException } from '@shared/domain/exceptions/domain.exception';
import { DuplicateDocumentNumberException } from '@employees/domain/exceptions/employee.exception';
import {
  DuplicateCheckInException,
  MissingCheckInException,
  DuplicateCheckOutException,
} from '@attendance/domain/exceptions/attendance.exception';

/**
 * Filtro global de excepciones que maneja:
 * - Excepciones de dominio (DomainException) → Mapeo a HTTP
 * - Excepciones HTTP de NestJS → Respuestas estándar
 * - Errores inesperados → Respuestas genéricas con logging
 *
 * @Catch() sin parámetros captura TODAS las excepciones, incluyendo:
 * - HttpException y sus subclases (BadRequestException, NotFoundException, etc.)
 * - Error y sus subclases (DomainException, y cualquier otro error)
 * - Cualquier otro tipo de excepción no esperada
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string | object;
    let error: string;

    // Manejar excepciones de dominio
    if (exception instanceof DomainException) {
      const httpStatus = this.mapDomainExceptionToHttpStatus(exception);
      status = httpStatus;
      message = exception.message;
      error = exception.constructor.name;

      this.logger.warn(
        `Domain Exception: ${error} - ${String(message)} - Path: ${request.url}`,
      );
    }
    // Manejar excepciones HTTP de NestJS
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const responseMessage =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : typeof exceptionResponse === 'object' &&
              exceptionResponse !== null &&
              'message' in exceptionResponse
            ? String(exceptionResponse.message)
            : exception.message;
      message = responseMessage;
      error = exception.name;

      // Solo loguear como warning si es 4xx, error si es 5xx
      if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(
          `HTTP Exception: ${error} - ${String(message)} - Path: ${request.url}`,
          exception.stack,
        );
      } else {
        this.logger.warn(
          `HTTP Exception: ${error} - ${String(message)} - Path: ${request.url}`,
        );
      }
    }
    // Manejar errores inesperados
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Ha ocurrido un error interno del servidor';
      error = 'InternalServerError';

      this.logger.error(
        `Unexpected Error: ${exception instanceof Error ? exception.message : String(exception)} - Path: ${request.url}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      error,
    });
  }

  /**
   * Mapea excepciones de dominio a códigos HTTP apropiados
   * Mantiene la lógica de mapeo en la capa de adaptadores
   */
  private mapDomainExceptionToHttpStatus(
    exception: DomainException,
  ): HttpStatus {
    // Excepciones de empleados
    if (exception instanceof DuplicateDocumentNumberException) {
      return HttpStatus.CONFLICT;
    }

    // Excepciones de asistencia
    if (exception instanceof DuplicateCheckInException) {
      return HttpStatus.BAD_REQUEST;
    }

    if (exception instanceof MissingCheckInException) {
      return HttpStatus.BAD_REQUEST;
    }

    if (exception instanceof DuplicateCheckOutException) {
      return HttpStatus.BAD_REQUEST;
    }

    // Por defecto, retornar Bad Request para excepciones de dominio no mapeadas
    return HttpStatus.BAD_REQUEST;
  }
}
