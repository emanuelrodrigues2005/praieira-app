import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "../src/app.module";
import { Connection } from "mongoose";
import { getConnectionToken } from "@nestjs/mongoose";
import * as amqp from "amqplib";

describe("service-analytics events (e2e)", () => {
  let app: INestApplication;
  let connection: Connection;
  let rmqChannel: amqp.Channel;
  let rmqConnection: amqp.Connection;

  const EXCHANGE = "praieira.events.test";
  const QUEUE = "analytics.events.test";
  const DLX = "praieira.dlx.test";
  const DLQ = "analytics.events.dlq.test";
  const RETRY_EXCHANGE = "praieira.retry.test";
  const RETRY_QUEUE = "analytics.events.retry.test";

  const WORKER_ID = "10000000-0000-4000-8000-000000000001";

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.MONGO_URL =
      process.env.MONGO_URL ?? "mongodb://localhost:27018/db_analytics_test";
    process.env.JWT_SECRET = "test-jwt-secret";
    process.env.RMQ_URL = "amqp://guest:guest@localhost:5673";
    process.env.RMQ_EXCHANGE = EXCHANGE;
    process.env.RMQ_QUEUE = QUEUE;
    process.env.RMQ_DLX = DLX;
    process.env.RMQ_DLQ = DLQ;
    process.env.RMQ_RETRY_EXCHANGE = RETRY_EXCHANGE;
    process.env.RMQ_RETRY_QUEUE = RETRY_QUEUE;
    process.env.MAX_RETRY_ATTEMPTS = "3";

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Connect RMQ microservice consumer (mirrors main.ts)
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RMQ_URL ?? "amqp://guest:guest@localhost:5673"],
        queue: process.env.RMQ_QUEUE ?? QUEUE,
        queueOptions: {
          durable: true,
          arguments: {
            "x-dead-letter-exchange":
              process.env.RMQ_DLX ?? DLX,
            "x-dead-letter-routing-key":
              process.env.RMQ_DLQ ?? DLQ,
          },
        },
        noAck: false,
        persistent: true,
        prefetchCount: 10,
        exchange: process.env.RMQ_EXCHANGE ?? EXCHANGE,
        exchangeType: "topic",
        wildcards: true,
      },
    });
    await app.startAllMicroservices();

    connection = app.get(getConnectionToken());

    // Setup RabbitMQ connection for publishing test events
    rmqConnection = await amqp.connect("amqp://guest:guest@localhost:5673");
    rmqChannel = await rmqConnection.createChannel();

    // Exchanges and queues created by RabbitMqTopologyService.setup()
    await rmqChannel.checkExchange(EXCHANGE);
    await rmqChannel.checkExchange(RETRY_EXCHANGE);
    await rmqChannel.checkExchange(DLX);
    await rmqChannel.checkQueue(QUEUE);
  });

  afterAll(async () => {
    if (rmqChannel) await rmqChannel.close();
    if (rmqConnection) await rmqConnection.close();
    if (connection) {
      await connection.dropDatabase();
      await connection.close();
    }
    await app.close();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
  });

  async function publishEvent(
    eventName: string,
    envelope: any,
    headers: Record<string, any> = {},
  ) {
    const packet = { pattern: eventName, data: envelope };

    rmqChannel.publish(
      EXCHANGE,
      eventName,
      Buffer.from(JSON.stringify(packet)),
      {
        persistent: true,
        contentType: "application/json",
        messageId: envelope.eventId,
        headers,
      },
    );

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  async function getMetrics(workerProfileId: string, date: string) {
    return connection
      .collection("worker_daily_metrics")
      .findOne({ workerProfileId, date });
  }

  // ── Duplicate events ──

  it("review.submitted.v1 duplicated → reviewsCount stays 1", async () => {
    const eventId = "dup-review-001";
    const envelope = {
      eventId,
      eventName: "review.submitted.v1",
      correlationId: "corr-001",
      producer: "service-reviews",
      payload: {
        workerProfileId: WORKER_ID,
        rating: 4,
        submittedAt: new Date().toISOString(),
      },
    };

    // Publish twice
    await publishEvent("review.submitted.v1", envelope);
    await publishEvent("review.submitted.v1", envelope);

    const today = new Date().toISOString().slice(0, 10);
    const metrics = await getMetrics(WORKER_ID, today);

    expect(metrics).not.toBeNull();
    expect(metrics!.reviewsCount).toBe(1);
    expect(metrics!.ratingSum).toBe(4);
  });

  it("contact.clicked.v1 duplicated → contactIntentions stays 1", async () => {
    const eventId = "dup-contact-001";
    const envelope = {
      eventId,
      eventName: "contact.clicked.v1",
      correlationId: "corr-002",
      producer: "service-reviews",
      payload: {
        workerProfileId: WORKER_ID,
        channel: "WHATSAPP",
        clickedAt: new Date().toISOString(),
      },
    };

    await publishEvent("contact.clicked.v1", envelope);
    await publishEvent("contact.clicked.v1", envelope);

    const today = new Date().toISOString().slice(0, 10);
    const metrics = await getMetrics(WORKER_ID, today);

    expect(metrics).not.toBeNull();
    expect(metrics!.contactIntentions).toBe(1);
    expect(metrics!.whatsappClicks).toBe(1);
  });

  it("profile.viewed.v1 duplicated → profileViews stays 1", async () => {
    const eventId = "dup-view-001";
    const envelope = {
      eventId,
      eventName: "profile.viewed.v1",
      correlationId: "corr-003",
      producer: "service-reviews",
      payload: {
        workerProfileId: WORKER_ID,
        viewerUserId: "viewer-001",
        viewerRole: "TOURIST",
        beach: "GAIBU",
        viewedAt: new Date().toISOString(),
      },
    };

    await publishEvent("profile.viewed.v1", envelope);
    await publishEvent("profile.viewed.v1", envelope);

    const today = new Date().toISOString().slice(0, 10);
    const metrics = await getMetrics(WORKER_ID, today);

    expect(metrics).not.toBeNull();
    expect(metrics!.profileViews).toBe(1);
  });

  // ── Invalid event → DLQ ──

  it("invalid event → message goes to DLQ", async () => {
    const envelope = {
      eventId: "invalid-001",
      eventName: "review.submitted.v1",
      correlationId: "corr-dlq",
      producer: "service-reviews",
      payload: {
        // Missing workerProfileId
        rating: 4,
      },
    };

    await publishEvent("review.submitted.v1", envelope);

    // Check DLQ
    await new Promise((resolve) => setTimeout(resolve, 500));
    const dlqMsg = await rmqChannel.get(DLQ, { noAck: true });
    expect(dlqMsg).not.toBeNull();
    if (dlqMsg) {
      const content = JSON.parse(dlqMsg.content.toString());
      expect(content.pattern).toBe("review.submitted.v1");
      expect(content.data.eventId).toBe("invalid-001");
    }
  });
});
