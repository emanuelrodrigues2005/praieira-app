import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { randomUUID } from "crypto";

interface OutboxRow {
  id: string;
  eventName: string;
  version: number;
  occurredAt: Date;
  correlationId: string;
  producer: string;
  actor: any;
  payload: any;
  status: string;
  attempts: number;
  lockedAt: Date | null;
  lockedBy: string | null;
  nextAttemptAt: Date | null;
  publishedAt: Date | null;
  failedAt: Date | null;
  lastError: string | null;
  createdAt: Date;
}

@Injectable()
export class OutboxRepository {
  private readonly logger = new Logger(OutboxRepository.name);
  private readonly instanceId = randomUUID();

  constructor(private readonly prisma: PrismaService) {}

  async create(
    eventName: string,
    payload: Record<string, unknown>,
    correlationId: string,
    actor?: { userId?: string; role?: string },
  ): Promise<OutboxRow> {
    const row = await this.prisma.$queryRawUnsafe<OutboxRow[]>(
      `INSERT INTO outbox_events (id, event_name, version, occurred_at, correlation_id, producer, actor, payload, status, attempts)
       VALUES ($1, $2, 1, NOW(), $3, 'service-reviews', $4::jsonb, $5::jsonb, 'PENDING', 0)
       RETURNING
         id,
         event_name AS "eventName",
         version,
         occurred_at AS "occurredAt",
         correlation_id AS "correlationId",
         producer,
         actor,
         payload,
         status,
         attempts,
         locked_at AS "lockedAt",
         locked_by AS "lockedBy",
         next_attempt_at AS "nextAttemptAt",
         published_at AS "publishedAt",
         failed_at AS "failedAt",
         last_error AS "lastError",
         created_at AS "createdAt"`,
      randomUUID(),
      eventName,
      correlationId,
      actor ? JSON.stringify(actor) : null,
      JSON.stringify(payload),
    );
    return row[0];
  }

  async fetchPending(batchSize: number): Promise<OutboxRow[]> {
    return this.prisma.$queryRawUnsafe<OutboxRow[]>(
      `SELECT
         id,
         event_name AS "eventName",
         version,
         occurred_at AS "occurredAt",
         correlation_id AS "correlationId",
         producer,
         actor,
         payload,
         status,
         attempts,
         locked_at AS "lockedAt",
         locked_by AS "lockedBy",
         next_attempt_at AS "nextAttemptAt",
         published_at AS "publishedAt",
         failed_at AS "failedAt",
         last_error AS "lastError",
         created_at AS "createdAt"
       FROM outbox_events
       WHERE (status = 'PENDING')
         AND (next_attempt_at IS NULL OR next_attempt_at <= NOW())
       ORDER BY occurred_at ASC
       LIMIT $1
       FOR UPDATE SKIP LOCKED`,
      batchSize,
    );
  }

  async claimPending(batchSize: number): Promise<OutboxRow[]> {
    return this.prisma.$queryRawUnsafe<OutboxRow[]>(
      `UPDATE outbox_events
       SET status = 'PROCESSING',
           locked_at = NOW(),
           locked_by = $1
       WHERE id IN (
         SELECT id FROM outbox_events
         WHERE (status = 'PENDING')
           AND (next_attempt_at IS NULL OR next_attempt_at <= NOW())
         ORDER BY occurred_at ASC
         LIMIT $2
         FOR UPDATE SKIP LOCKED
       )
       RETURNING
         id,
         event_name AS "eventName",
         version,
         occurred_at AS "occurredAt",
         correlation_id AS "correlationId",
         producer,
         actor,
         payload,
         status,
         attempts,
         locked_at AS "lockedAt",
         locked_by AS "lockedBy",
         next_attempt_at AS "nextAttemptAt",
         published_at AS "publishedAt",
         failed_at AS "failedAt",
         last_error AS "lastError",
         created_at AS "createdAt"`,
      this.instanceId,
      batchSize,
    );
  }

  async markPublished(id: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `UPDATE outbox_events
       SET status = 'PUBLISHED',
           published_at = NOW(),
           locked_at = NULL,
           locked_by = NULL,
           last_error = NULL
       WHERE id = $1`,
      id,
    );
  }

  async markFailed(
    id: string,
    error: string,
    nextAttemptAt: Date,
  ): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `UPDATE outbox_events
       SET attempts = attempts + 1,
           status = 'PENDING',
           locked_at = NULL,
           locked_by = NULL,
           next_attempt_at = $2,
           last_error = $3
       WHERE id = $1`,
      id,
      nextAttemptAt,
      error,
    );
  }

  async markDead(id: string, error: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `UPDATE outbox_events
       SET status = 'DEAD',
           failed_at = NOW(),
           locked_at = NULL,
           locked_by = NULL,
           last_error = $2
       WHERE id = $1`,
      id,
      error,
    );
  }
}
