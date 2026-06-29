import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OutboxEvent } from "@prisma/client";
import { randomUUID } from "crypto";

@Injectable()
export class OutboxRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    eventName: string,
    payload: Record<string, unknown>,
    correlationId: string,
    actor?: { userId?: string; role?: string },
  ): Promise<OutboxEvent> {
    return this.prisma.outboxEvent.create({
      data: {
        id: randomUUID(),
        eventName,
        version: 1,
        occurredAt: new Date(),
        correlationId,
        producer: "service-reviews",
        actor: actor ? (actor as any) : undefined,
        payload: payload as any,
        attempts: 0,
      },
    });
  }

  async fetchPending(batchSize: number): Promise<OutboxEvent[]> {
    return this.prisma.$queryRawUnsafe<OutboxEvent[]>(
      `SELECT * FROM outbox_events
       WHERE published_at IS NULL
         AND (next_attempt_at IS NULL OR next_attempt_at <= NOW())
       ORDER BY occurred_at ASC
       LIMIT $1
       FOR UPDATE SKIP LOCKED`,
      batchSize,
    );
  }

  async markPublished(id: string): Promise<void> {
    await this.prisma.outboxEvent.update({
      where: { id },
      data: { publishedAt: new Date(), lastError: null },
    });
  }

  async markFailed(
    id: string,
    error: string,
    nextAttemptAt: Date,
  ): Promise<void> {
    await this.prisma.outboxEvent.update({
      where: { id },
      data: {
        attempts: { increment: 1 },
        lastError: error,
        nextAttemptAt,
      },
    });
  }
}
