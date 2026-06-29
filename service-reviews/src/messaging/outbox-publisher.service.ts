import { Injectable, Inject, Logger, OnModuleDestroy } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { OutboxRepository } from "./outbox.repository";
import { DomainEvent } from "./domain-event";
import { lastValueFrom, timeout } from "rxjs";

@Injectable()
export class OutboxPublisherService implements OnModuleDestroy {
  private readonly logger = new Logger(OutboxPublisherService.name);
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor(
    private readonly outboxRepo: OutboxRepository,
    @Inject("RMQ_CLIENT") private readonly rmqClient: ClientProxy,
  ) {}

  start(pollIntervalMs = 1000, batchSize = 20) {
    if (this.intervalId) return;
    this.logger.log(
      `Starting outbox publisher (poll=${pollIntervalMs}ms, batch=${batchSize})`,
    );
    this.intervalId = setInterval(() => this.process(batchSize), pollIntervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onModuleDestroy() {
    this.stop();
    this.running = false;
  }

  private async process(batchSize: number) {
    if (this.running) return;
    this.running = true;

    try {
      const events = await this.outboxRepo.fetchPending(batchSize);
      for (const event of events) {
        await this.publishOne(event);
      }
    } catch (error: any) {
      this.logger.error(`Outbox processing error: ${error.message}`);
    } finally {
      this.running = false;
    }
  }

  private async publishOne(event: any) {
    const maxAttempts = parseInt(
      process.env.OUTBOX_MAX_ATTEMPTS ?? "10",
      10,
    );

    if (event.attempts >= maxAttempts) {
      this.logger.warn(`Event ${event.id} exceeded max attempts, skipping`);
      await this.outboxRepo.markPublished(event.id);
      return;
    }

    try {
      const envelope: DomainEvent<unknown> = {
        eventId: event.id,
        eventName: event.eventName,
        version: 1,
        occurredAt: event.occurredAt.toISOString(),
        correlationId: event.correlationId,
        producer: event.producer,
        actor: event.actor as any,
        payload: event.payload,
      };

      const exchange = process.env.RMQ_EXCHANGE ?? "praieira.events";
      await lastValueFrom(
        this.rmqClient.emit(event.eventName, envelope).pipe(timeout(5000)),
      );

      await this.outboxRepo.markPublished(event.id);
      this.logger.debug(`Published event ${event.id}: ${event.eventName}`);
    } catch (error: any) {
      const retryBaseDelay = parseInt(
        process.env.OUTBOX_RETRY_BASE_DELAY_MS ?? "2000",
        10,
      );
      const nextAttemptAt = new Date(
        Date.now() + retryBaseDelay * Math.pow(2, event.attempts),
      );
      await this.outboxRepo.markFailed(
        event.id,
        error.message,
        nextAttemptAt,
      );
      this.logger.warn(
        `Failed to publish event ${event.id} (attempt ${event.attempts + 1}): ${error.message}`,
      );
    }
  }
}
