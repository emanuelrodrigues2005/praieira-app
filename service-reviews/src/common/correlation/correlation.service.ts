import { Injectable, Scope, Inject } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { randomUUID } from "crypto";
import { CORRELATION_ID_KEY } from "./correlation.middleware";

@Injectable({ scope: Scope.REQUEST })
export class CorrelationService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  getCorrelationId(): string {
    return (this.request as any)?.[CORRELATION_ID_KEY] ?? randomUUID();
  }
}
