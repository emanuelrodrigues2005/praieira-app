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
  private maxAttempts: number;
  private retryBaseDelay: number;

  constructor(
    private readonly outboxRepo: OutboxRepository,
    @Inject("RMQ_CLIENT") private readonly rmqClient: ClientProxy,
  ) {
    this.maxAttempts = parseInt(
      process.env.OUTBOX_MAX_ATTEMPTS ?? "10",
      10,
    );
    this.retryBaseDelay = parseInt(
      process.env.OUTBOX_RETRY_BASE_DELAY_MS ?? "2000",
      10,
    );
  }

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
      // Claim events atomically
      const events = await this.outboxRepo.claimPending(batchSize);
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
    // Check max attempts BEFORE attempting
    if (event.attempts >= this.maxAttempts) {
      this.logger.warn(
        `Event ${event.id} exceeded max attempts (${event.attempts}/${this.maxAttempts}), marking DEAD`,
      );
      await this.outboxRepo.markDead(
        event.id,
        `Exceeded max attempts: ${event.attempts}`,
      );
      return;
    }

    try {
      const envelope: DomainEvent<unknown> = {
        eventId: event.id,
        eventName: event.eventName,
        version: 1,
        occurredAt:
          event.occurredAt instanceof Date
            ? event.occurredAt.toISOString()
            : event.occurredAt,
        correlationId: event.correlationId,
        producer: event.producer,
        actor: event.actor,
        payload: event.payload,
      };

      await lastValueFrom(
        this.rmqClient
          .emit(event.eventName, envelope)
          .pipe(timeout(5000)),
      );

      // Mark PUBLISHED only after broker confirms
      await this.outboxRepo.markPublished(event.id);
      this.logger.debug(`Published event ${event.id}: ${event.eventName}`);
    } catch (error: any) {
      // On failure, schedule retry or mark DEAD
      const nextAttempts = event.attempts + 1;
      if (nextAttempts >= this.maxAttempts) {
        await this.outboxRepo.markDead(event.id, error.message);
        this.logger.warn(
          `Event ${event.id} DEAD after ${nextAttempts} attempts: ${error.message}`,
        );
      } else {
        const nextAttemptAt = new Date(
          Date.now() + this.retryBaseDelay * Math.pow(2, event.attempts),
        );
        await this.outboxRepo.markFailed(
          event.id,
          error.message,
          nextAttemptAt,
        );
        this.logger.warn(
          `Event ${event.id} failed (attempt ${nextAttempts}/${this.maxAttempts}): ${error.message}`,
        );
      }
    }
  }
}
