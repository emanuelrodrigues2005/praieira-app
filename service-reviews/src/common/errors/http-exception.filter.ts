import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ErrorResponse } from "../http/response.interface";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId =
      (request.headers["x-correlation-id"] as string) || "unknown";

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "INTERNAL_ERROR";
    let message = "Internal server error";
    let details: Array<{ field: string; message: string }> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = this.mapStatusToCode(status);
      message = exception.message;
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        const resp = exceptionResponse as any;
        if (Array.isArray(resp.message)) {
          details = resp.message.map((m: string) => {
            const [field, ...rest] = m.split(" ");
            return { field, message: rest.join(" ") || m };
          });
          message = "Validation failed";
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
      );
    }

    const body: ErrorResponse = {
      error: {
        code,
        message,
        details,
      },
      meta: {
        requestId: correlationId,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(status).json(body);
  }

  private mapStatusToCode(status: number): string {
    switch (status) {
      case 400:
        return "VALIDATION_ERROR";
      case 401:
        return "UNAUTHORIZED";
      case 403:
        return "FORBIDDEN";
      case 404:
        return "NOT_FOUND";
      case 409:
        return "CONFLICT";
      case 422:
        return "UNPROCESSABLE_ENTITY";
      default:
        return "INTERNAL_ERROR";
    }
  }
}
