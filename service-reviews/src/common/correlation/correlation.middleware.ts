import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export const CORRELATION_ID_HEADER = "x-correlation-id";
export const CORRELATION_ID_KEY = "correlationId";

declare global {
  namespace Express {
    interface Request {
      [CORRELATION_ID_KEY]: string;
    }
  }
}

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const received = req.headers[CORRELATION_ID_HEADER];
    const providedId = typeof received === "string" ? received.trim() : "";
    const correlationId =
      providedId.length > 0 && providedId.length <= 100
        ? providedId
        : randomUUID();
    req.headers[CORRELATION_ID_HEADER] = correlationId;
    req[CORRELATION_ID_KEY] = correlationId;
    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    next();
  }
}
