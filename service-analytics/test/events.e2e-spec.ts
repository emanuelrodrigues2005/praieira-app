import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { Connection } from "mongoose";
import { getConnectionToken } from "@nestjs/mongoose";
import { AnalyticsService } from "../src/analytics.service";
import { RabbitMqTopologyService } from "../src/messaging/rabbitmq-topology.service";

describe("service-analytics events (e2e)", () => {
  let app: INestApplication;
  let analyticsService: AnalyticsService;
  let connection: Connection;

  const WORKER_ID = "10000000-0000-4000-8000-000000000001";

  const mockTopologyService = {
    setup: jest.fn().mockResolvedValue(undefined),
    onModuleInit: jest.fn().mockResolvedValue(undefined),
    onModuleDestroy: jest.fn().mockResolvedValue(undefined),
    publishToRetry: jest.fn().mockResolvedValue(undefined),
    publishToDlq: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.MONGO_URL =
      process.env.MONGO_URL ?? "mongodb://localhost:27018/db_analytics_test";
    process.env.JWT_SECRET = "test-jwt-secret";

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(RabbitMqTopologyService)
      .useValue(mockTopologyService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    analyticsService = moduleFixture.get(AnalyticsService);
    connection = app.get(getConnectionToken());
  }, 15000);

  afterAll(async () => {
    if (connection) {
      await connection.dropDatabase();
      await connection.close();
    }
    await app.close();
  });

  beforeEach(async () => {
    await connection.dropDatabase();
    jest.clearAllMocks();
  });

  async function getMetrics(workerProfileId: string, date: string) {
    return connection
      .collection("worker_daily_metrics")
      .findOne({ workerProfileId, date });
  }

  // ── Duplicate events ──

  it("review.submitted.v1 duplicated → reviewsCount stays 1", async () => {
    const eventId = "dup-review-001";
    const data = {
      eventId,
      workerProfileId: WORKER_ID,
      rating: 4,
      submittedAt: new Date().toISOString(),
    };

    await analyticsService.handleReviewSubmitted(data);
    await analyticsService.handleReviewSubmitted({ ...data, rating: 5 });

    const today = new Date().toISOString().slice(0, 10);
    const metrics = await getMetrics(WORKER_ID, today);
    expect(metrics).not.toBeNull();
    expect(metrics!.reviewsCount).toBe(1);
    expect(metrics!.ratingSum).toBe(4);
  });

  it("contact.clicked.v1 duplicated → contactIntentions stays 1", async () => {
    const eventId = "dup-contact-001";
    const data = {
      eventId,
      workerProfileId: WORKER_ID,
      channel: "WHATSAPP" as const,
      clickedAt: new Date().toISOString(),
    };

    await analyticsService.handleContactClicked(data);
    await analyticsService.handleContactClicked(data);

    const today = new Date().toISOString().slice(0, 10);
    const metrics = await getMetrics(WORKER_ID, today);
    expect(metrics).not.toBeNull();
    expect(metrics!.contactIntentions).toBe(1);
    expect(metrics!.whatsappClicks).toBe(1);
  });

  it("profile.viewed.v1 duplicated → profileViews stays 1", async () => {
    const eventId = "dup-view-001";
    const data = {
      eventId,
      workerProfileId: WORKER_ID,
      viewerUserId: "viewer-001",
      viewerRole: "TOURIST",
      beach: "GAIBU",
      viewedAt: new Date().toISOString(),
    };

    await analyticsService.handleProfileViewed(data);
    await analyticsService.handleProfileViewed(data);

    const today = new Date().toISOString().slice(0, 10);
    const metrics = await getMetrics(WORKER_ID, today);
    expect(metrics).not.toBeNull();
    expect(metrics!.profileViews).toBe(1);
  });

  // ── Multi-event aggregation ──

  it("aggregates profileViews + contactIntentions for same worker", async () => {
    const today = new Date().toISOString().slice(0, 10);

    await analyticsService.handleProfileViewed({
      eventId: "evt-v1", workerProfileId: WORKER_ID,
      viewerUserId: "v1", beach: "GAIBU",
      viewedAt: new Date().toISOString(),
    });

    await analyticsService.handleProfileViewed({
      eventId: "evt-v2", workerProfileId: WORKER_ID,
      viewerUserId: "v2", beach: "GAIBU",
      viewedAt: new Date().toISOString(),
    });

    await analyticsService.handleContactClicked({
      eventId: "evt-c1", workerProfileId: WORKER_ID,
      channel: "WHATSAPP", clickedAt: new Date().toISOString(),
    });

    const metrics = await getMetrics(WORKER_ID, today);
    expect(metrics).not.toBeNull();
    expect(metrics!.profileViews).toBe(2);
    expect(metrics!.contactIntentions).toBe(1);
    expect(metrics!.whatsappClicks).toBe(1);
  });

  // ── Different events with same channel → counts stack ──

  it("handles multiple contact channels correctly", async () => {
    const today = new Date().toISOString().slice(0, 10);

    await analyticsService.handleContactClicked({
      eventId: "evt-w1", workerProfileId: WORKER_ID,
      channel: "WHATSAPP", clickedAt: new Date().toISOString(),
    });

    await analyticsService.handleContactClicked({
      eventId: "evt-p1", workerProfileId: WORKER_ID,
      channel: "PHONE", clickedAt: new Date().toISOString(),
    });

    const metrics = await getMetrics(WORKER_ID, today);
    expect(metrics).not.toBeNull();
    expect(metrics!.contactIntentions).toBe(2);
    expect(metrics!.whatsappClicks).toBe(1);
    expect(metrics!.phoneClicks).toBe(1);
  });
});
