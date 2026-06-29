import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as amqp from "amqplib";

@Injectable()
export class RabbitMqTopologyService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMqTopologyService.name);
  private connection: amqp.Connection | null = null;

  private readonly rmqUrl: string;
  private readonly exchange: string;
  private readonly queue: string;
  private readonly retryExchange: string;
  private readonly retryQueue: string;
  private readonly dlx: string;
  private readonly dlq: string;
  private readonly retryDelayMs: number;
  private readonly maxRetryAttempts: number;

  constructor() {
    this.rmqUrl = process.env.RMQ_URL ?? "amqp://guest:guest@localhost:5672";
    this.exchange = process.env.RMQ_EXCHANGE ?? "praieira.events";
    this.queue = process.env.RMQ_QUEUE ?? "analytics.events";
    this.retryExchange =
      process.env.RMQ_RETRY_EXCHANGE ?? "praieira.retry";
    this.retryQueue =
      process.env.RMQ_RETRY_QUEUE ?? "analytics.events.retry";
    this.dlx = process.env.RMQ_DLX ?? "praieira.dlx";
    this.dlq = process.env.RMQ_DLQ ?? "analytics.events.dlq";
    this.retryDelayMs = parseInt(
      process.env.RETRY_DELAY_MS ?? "2000",
      10,
    );
    this.maxRetryAttempts = parseInt(
      process.env.MAX_RETRY_ATTEMPTS ?? "3",
      10,
    );
  }

  async onModuleInit() {
    await this.setup();
  }

  async setup() {
    try {
      this.connection = await amqp.connect(this.rmqUrl);
      const channel = await this.connection.createChannel();

      // ── Main exchange (topic) ──
      await channel.assertExchange(this.exchange, "topic", {
        durable: true,
      });
      this.logger.log(`Exchange declared: ${this.exchange}`);

      // ── Retry exchange ──
      await channel.assertExchange(this.retryExchange, "topic", {
        durable: true,
      });
      this.logger.log(`Retry exchange declared: ${this.retryExchange}`);

      // ── DLX ──
      await channel.assertExchange(this.dlx, "topic", {
        durable: true,
      });
      this.logger.log(`DLX declared: ${this.dlx}`);

      // ── DLQ ──
      await channel.assertQueue(this.dlq, {
        durable: true,
      });
      await channel.bindQueue(this.dlq, this.dlx, this.dlq);
      this.logger.log(`DLQ declared: ${this.dlq}`);

      // ── Retry queue (with TTL → DLX back to main) ──
      await channel.assertQueue(this.retryQueue, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": this.exchange,
          "x-dead-letter-routing-key": "#",
          "x-message-ttl": this.retryDelayMs,
          "x-max-retries": this.maxRetryAttempts,
        },
      });
      await channel.bindQueue(
        this.retryQueue,
        this.retryExchange,
        "#",
      );
      this.logger.log(
        `Retry queue declared: ${this.retryQueue} (TTL=${this.retryDelayMs}ms, DLX→${this.exchange})`,
      );

      // ── Main queue (with DLX → praieira.dlx) ──
      await channel.assertQueue(this.queue, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": this.dlx,
          "x-dead-letter-routing-key": this.dlq,
        },
      });

      // Bind main queue to all relevant events
      const bindings = [
        "profile.viewed.v1",
        "review.submitted.v1",
        "review.updated.v1",
        "review.removed.v1",
        "review.moderated.v1",
        "contact.clicked.v1",
      ];
      for (const key of bindings) {
        await channel.bindQueue(this.queue, this.exchange, key);
      }
      this.logger.log(
        `Queue declared: ${this.queue} with ${bindings.length} bindings`,
      );

      await channel.close();
      this.logger.log("RabbitMQ topology setup complete");
    } catch (error: any) {
      this.logger.error(
        `Failed to setup RabbitMQ topology: ${error.message}`,
      );
      // Don't crash — the topology might already exist,
      // or RMQ might not be available yet
    }
  }

  async publishToRetry(
    eventName: string,
    envelope: any,
    retryCount: number,
    failureReason: string,
  ) {
    if (!this.connection) {
      throw new Error("RabbitMQ connection not available");
    }

    const channel = await this.connection.createConfirmChannel();

    try {
      const message = {
        ...envelope,
        _retry: {
          count: retryCount + 1,
          maxAttempts: this.maxRetryAttempts,
          failureReason,
          routedAt: new Date().toISOString(),
        },
      };

      channel.publish(
        this.retryExchange,
        eventName,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
          contentType: "application/json",
          messageId: envelope.eventId,
          headers: {
            "x-retry-count": retryCount + 1,
            "x-correlation-id": envelope.correlationId,
          },
        },
      );

      await channel.waitForConfirms();
      this.logger.debug(
        `Published to retry: ${eventName} (retry ${retryCount + 1}/${this.maxRetryAttempts})`,
      );
    } finally {
      await channel.close();
    }
  }

  async publishToDlq(
    eventName: string,
    envelope: any,
    retryCount: number,
    error: string,
  ) {
    if (!this.connection) {
      throw new Error("RabbitMQ connection not available");
    }

    const channel = await this.connection.createConfirmChannel();

    try {
      const message = {
        ...envelope,
        _dead: {
          attempts: retryCount + 1,
          lastError: error,
          deadAt: new Date().toISOString(),
        },
      };

      channel.publish(
        this.dlx,
        this.dlq,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
          contentType: "application/json",
          messageId: envelope.eventId,
          headers: {
            "x-dead-reason": error,
            "x-correlation-id": envelope.correlationId,
          },
        },
      );

      await channel.waitForConfirms();
      this.logger.warn(
        `Published to DLQ: ${eventName} (after ${retryCount + 1} attempts)`,
      );
    } finally {
      await channel.close();
    }
  }
}
