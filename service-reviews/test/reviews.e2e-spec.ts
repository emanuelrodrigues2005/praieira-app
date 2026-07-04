// Set test environment before any imports
process.env.NODE_ENV = "test";
process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres@localhost:5433/db_reviews_test?schema=public";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.CATALOG_URL = "http://localhost:3302";
process.env.CATALOG_MODE = "stub";
process.env.STUB_WORKER_PROFILE_ID = "10000000-0000-4000-8000-000000000001";
process.env.STUB_WORKER_PROFILE_STATUS = "APPROVED";
process.env.STUB_WORKER_PROFILE_ACTIVE = "true";
process.env.STUB_WORKER_WHATSAPP = "5581999999999";
process.env.STUB_WORKER_PHONE = "5581812345678";
process.env.STUB_WORKER_PROFILE_NAME = "Barraca do João";
process.env.STUB_WORKER_PROFILE_CATEGORY = "Alimentação";
process.env.STUB_WORKER_PROFILE_BEACH = "Porto de Galinhas";

import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { cleanDatabase, disconnectDatabase } from "./helpers/db-helper";
import {
  generateToken,
  TOURIST_A,
  TOURIST_B,
  WORKER,
  CURATOR,
  WORKER_PROFILE_ID,
} from "./helpers/auth-helper";
import {
  createFakeCatalogServer,
  FakeCatalogProfile,
} from "./helpers/fake-catalog-server";
import { Server } from "http";

describe("service-reviews (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let catalogServer: Server;

  const defaultProfile: FakeCatalogProfile = {
    id: WORKER_PROFILE_ID,
    publicationStatus: "APPROVED",
    isActive: true,
    whatsapp: "5581999999999",
    phone: "5581812345678",
    name: "Barraca do João",
    category: "Alimentação",
    beach: "Porto de Galinhas",
  };

  beforeAll(async () => {
    // Start fake catalog server
    catalogServer = createFakeCatalogServer([defaultProfile], 3302);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await disconnectDatabase(prisma);
    await app.close();
    catalogServer.close();
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  // ── C1: Health ──
  describe("GET /health", () => {
    it("returns ok with dependency status", async () => {
      const res = await request(app.getHttpServer())
        .get("/health")
        .expect(200);

      expect(res.body.status).toMatch(/ok|degraded/);
      expect(res.body.service).toBe("service-reviews");
      expect(res.body.dependencies).toBeDefined();
      expect(res.body.dependencies.database).toBe("up");
    });
  });

  // ── C2: Auth — no JWT → 401 ──
  describe("POST /reviews", () => {
    it("returns 401 without JWT", async () => {
      await request(app.getHttpServer())
        .post("/reviews")
        .send({
          workerProfileId: WORKER_PROFILE_ID,
          rating: 5,
        })
        .expect(401);
    });

    // ── C3: Role — WORKER → 403 ──
    it("returns 403 for WORKER role", async () => {
      const token = generateToken(WORKER);
      await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          workerProfileId: WORKER_PROFILE_ID,
          rating: 5,
        })
        .expect(403);
    });

    // ── C4: Invalid rating → 400 ──
    it("returns 400 for rating 0", async () => {
      const token = generateToken(TOURIST_A);
      await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          workerProfileId: WORKER_PROFILE_ID,
          rating: 0,
        })
        .expect(400);
    });

    it("returns 400 for rating 6", async () => {
      const token = generateToken(TOURIST_A);
      await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          workerProfileId: WORKER_PROFILE_ID,
          rating: 6,
        })
        .expect(400);
    });

    // ── C5: Valid creation → 201 ──
    it("returns 201 for valid review", async () => {
      const token = generateToken(TOURIST_A);
      const res = await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          workerProfileId: WORKER_PROFILE_ID,
          rating: 5,
          comment: "Atendimento excelente.",
        })
        .expect(201);

      expect(res.body.data.rating).toBe(5);
      expect(res.body.data.comment).toBe("Atendimento excelente.");
      expect(res.body.data.touristUserId).toBe(TOURIST_A.sub);
      expect(res.body.data.status).toBe("PUBLISHED");
      expect(res.body.meta.requestId).toBeDefined();
    });

    // ── C6: touristUserId from JWT (rejected if sent in body) ──
    it("rejects touristUserId in body (forbidNonWhitelisted)", async () => {
      const token = generateToken(TOURIST_A);
      await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          workerProfileId: WORKER_PROFILE_ID,
          rating: 4,
          touristUserId: "hacked-id",
        })
        .expect(400);
      // forbidNonWhitelisted correctly rejects unknown properties
    });

    // ── C7: Duplicate review → 409 ──
    it("returns 409 for duplicate review", async () => {
      const token = generateToken(TOURIST_A);
      // First review
      await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          workerProfileId: WORKER_PROFILE_ID,
          rating: 5,
        })
        .expect(201);

      // Duplicate
      await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({
          workerProfileId: WORKER_PROFILE_ID,
          rating: 4,
        })
        .expect(409);
    });
  });

  // ── C8: List reviews ──
  describe("GET /reviews/worker/:workerProfileId", () => {
    it("returns paginated public reviews (no touristUserId)", async () => {
      const token = generateToken(TOURIST_A);
      await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({ workerProfileId: WORKER_PROFILE_ID, rating: 5 })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/reviews/worker/${WORKER_PROFILE_ID}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].rating).toBe(5);
      expect(res.body.data[0].touristUserId).toBeUndefined();
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.total).toBe(1);
    });
  });

  // ── C9-C10: Summary ──
  describe("GET /reviews/worker/:workerProfileId/summary", () => {
    it("returns zeros for worker with no reviews", async () => {
      const res = await request(app.getHttpServer())
        .get(`/reviews/worker/${WORKER_PROFILE_ID}/summary`)
        .expect(200);

      expect(res.body.data.averageRating).toBe(0);
      expect(res.body.data.totalReviews).toBe(0);
      expect(res.body.data.distribution).toEqual({
        "1": 0, "2": 0, "3": 0, "4": 0, "5": 0,
      });
    });

    it("calculates correct average and distribution", async () => {
      const tokenA = generateToken(TOURIST_A);
      const tokenB = generateToken(TOURIST_B);

      // 5 stars
      await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          workerProfileId: WORKER_PROFILE_ID,
          rating: 5,
        })
        .expect(201);

      // 3 stars
      await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${tokenB}`)
        .send({
          workerProfileId: WORKER_PROFILE_ID,
          rating: 3,
        })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/reviews/worker/${WORKER_PROFILE_ID}/summary`)
        .expect(200);

      expect(res.body.data.averageRating).toBe(4.0);
      expect(res.body.data.totalReviews).toBe(2);
      expect(res.body.data.distribution["3"]).toBe(1);
      expect(res.body.data.distribution["5"]).toBe(1);
    });
  });

  // ── C11-C12: Edit review ──
  describe("PATCH /reviews/:id", () => {
    it("allows author to edit their review", async () => {
      const token = generateToken(TOURIST_A);
      const createRes = await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({ workerProfileId: WORKER_PROFILE_ID, rating: 3 })
        .expect(201);

      const reviewId = createRes.body.data.id;

      const updateRes = await request(app.getHttpServer())
        .patch(`/reviews/${reviewId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 4, comment: "Updated!" })
        .expect(200);

      expect(updateRes.body.data.rating).toBe(4);
      expect(updateRes.body.data.comment).toBe("Updated!");
    });

    it("blocks non-author from editing", async () => {
      const tokenA = generateToken(TOURIST_A);
      const tokenB = generateToken(TOURIST_B);

      const createRes = await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ workerProfileId: WORKER_PROFILE_ID, rating: 3 })
        .expect(201);

      const reviewId = createRes.body.data.id;

      await request(app.getHttpServer())
        .patch(`/reviews/${reviewId}`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ rating: 5 })
        .expect(403);
    });
  });

  // ── C13: Soft delete ──
  describe("DELETE /reviews/:id", () => {
    it("allows author to soft-delete their review", async () => {
      const token = generateToken(TOURIST_A);
      const createRes = await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({ workerProfileId: WORKER_PROFILE_ID, rating: 3 })
        .expect(201);

      const reviewId = createRes.body.data.id;

      const deleteRes = await request(app.getHttpServer())
        .delete(`/reviews/${reviewId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(deleteRes.body.data.status).toBe("REMOVED");

      // Removed review should not appear in listing
      const listRes = await request(app.getHttpServer())
        .get(`/reviews/worker/${WORKER_PROFILE_ID}`)
        .expect(200);

      expect(listRes.body.data).toHaveLength(0);
    });
  });

  // ── C14: Moderation ──
  describe("PATCH /reviews/:id/moderation", () => {
    it("allows CURATOR to hide a review with reason", async () => {
      const token = generateToken(TOURIST_A);
      const curatorToken = generateToken(CURATOR);

      const createRes = await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({ workerProfileId: WORKER_PROFILE_ID, rating: 2 })
        .expect(201);

      const reviewId = createRes.body.data.id;

      const modRes = await request(app.getHttpServer())
        .patch(`/reviews/${reviewId}/moderation`)
        .set("Authorization", `Bearer ${curatorToken}`)
        .send({ action: "HIDDEN", reason: "Conteúdo abusivo" })
        .expect(200);

      expect(modRes.body.data.status).toBe("HIDDEN");
      expect(modRes.body.data.moderationReason).toBe("Conteúdo abusivo");
      expect(modRes.body.data.moderatedByUserId).toBe(CURATOR.sub);
    });
  });

  // ── C15-C16-C17: Contact ──
  describe("POST /interactions/contact/:workerProfileId", () => {
    it("registers anonymous contact", async () => {
      const res = await request(app.getHttpServer())
        .post(`/interactions/contact/${WORKER_PROFILE_ID}`)
        .send({ channel: "WHATSAPP", source: "PROFILE_DETAIL" })
        .expect(201);

      expect(res.body.data.interactionId).toBeDefined();
      expect(res.body.data.channel).toBe("WHATSAPP");
      expect(res.body.data.contactUrl).toContain("wa.me");
      expect(res.body.data.disclaimer).toContain("não representa venda");
    });

    it("registers authenticated contact with touristUserId", async () => {
      const token = generateToken(TOURIST_A);
      const res = await request(app.getHttpServer())
        .post(`/interactions/contact/${WORKER_PROFILE_ID}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ channel: "PHONE", source: "MAP" })
        .expect(201);

      expect(res.body.data.interactionId).toBeDefined();
      expect(res.body.data.channel).toBe("PHONE");
      expect(res.body.data.contactUrl).toContain("tel:");
    });

    it("includes disclaimer about contact intention", async () => {
      const res = await request(app.getHttpServer())
        .post(`/interactions/contact/${WORKER_PROFILE_ID}`)
        .send({ channel: "WHATSAPP" })
        .expect(201);

      expect(res.body.data.disclaimer).toBe(
        "Esta ação registra uma intenção de contato e não representa venda ou transação confirmada.",
      );
    });
  });

  // ── C18-C19: Outbox events ──
  describe("Outbox", () => {
    it("creates outbox event when review is submitted", async () => {
      const token = generateToken(TOURIST_A);
      await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({ workerProfileId: WORKER_PROFILE_ID, rating: 5 })
        .expect(201);

      const events = await prisma.outboxEvent.findMany();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe("review.submitted.v1");
      expect(events[0].payload).toHaveProperty("reviewId");
      expect(events[0].payload).toHaveProperty("rating", 5);
    });

    it("creates outbox event when contact is registered", async () => {
      await request(app.getHttpServer())
        .post(`/interactions/contact/${WORKER_PROFILE_ID}`)
        .send({ channel: "WHATSAPP" })
        .expect(201);

      const events = await prisma.outboxEvent.findMany({
        where: { eventName: "contact.clicked.v1" },
      });
      expect(events).toHaveLength(1);
      expect(events[0].payload).toHaveProperty("interactionId");
      expect(events[0].payload).toHaveProperty("channel", "WHATSAPP");
    });
  });

  // ── C22: Correlation ID ──
  describe("Correlation ID", () => {
    it("preserves x-correlation-id in response", async () => {
      const correlationId = "test-correlation-123";
      const res = await request(app.getHttpServer())
        .get("/health")
        .set("x-correlation-id", correlationId)
        .expect(200);

      expect(res.headers["x-correlation-id"]).toBe(correlationId);
      expect(res.body.status).toBeDefined();
    });

    it("generates x-correlation-id if not provided", async () => {
      const res = await request(app.getHttpServer())
        .get("/health")
        .expect(200);

      expect(res.headers["x-correlation-id"]).toBeDefined();
    });
  });

  // ── Reports ──
  describe("POST /reviews/:id/reports", () => {
    it("creates a report for an existing review", async () => {
      const token = generateToken(TOURIST_A);
      const tokenB = generateToken(TOURIST_B);

      const createRes = await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({ workerProfileId: WORKER_PROFILE_ID, rating: 5 })
        .expect(201);

      const reviewId = createRes.body.data.id;

      const reportRes = await request(app.getHttpServer())
        .post(`/reviews/${reviewId}/reports`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ reason: "SPAM" })
        .expect(201);

      expect(reportRes.body.data.reason).toBe("SPAM");
      expect(reportRes.body.data.status).toBe("PENDING");

      // Check outbox event
      const events = await prisma.outboxEvent.findMany({
        where: { eventName: "review.reported.v1" },
      });
      expect(events).toHaveLength(1);
    });
  });

  // ── GET /reviews/me ──
  describe("GET /reviews/me", () => {
    it("returns 401 without JWT", async () => {
      await request(app.getHttpServer())
        .get("/reviews/me")
        .expect(401);
    });

    it("returns 403 for WORKER role", async () => {
      const token = generateToken(WORKER);
      await request(app.getHttpServer())
        .get("/reviews/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(403);
    });

    it("returns empty array if user has no reviews", async () => {
      const token = generateToken(TOURIST_A);
      const res = await request(app.getHttpServer())
        .get("/reviews/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);
    });

    it("returns paginated reviews with workerName", async () => {
      const token = generateToken(TOURIST_A);
      // Create a review
      await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({ workerProfileId: WORKER_PROFILE_ID, rating: 4, comment: "Bom!" })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get("/reviews/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].workerName).toBe("Barraca do João");
      expect(res.body.data[0].rating).toBe(4);
      expect(res.body.data[0].workerProfileId).toBe(WORKER_PROFILE_ID);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.total).toBe(1);
    });

    it("only returns authenticated user's reviews", async () => {
      const tokenA = generateToken(TOURIST_A);
      const tokenB = generateToken(TOURIST_B);

      // TOURIST_A creates a review
      await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ workerProfileId: WORKER_PROFILE_ID, rating: 5 })
        .expect(201);

      // TOURIST_B creates a review
      await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ workerProfileId: WORKER_PROFILE_ID, rating: 3 })
        .expect(201);

      // TOURIST_A sees only their own review
      const res = await request(app.getHttpServer())
        .get("/reviews/me")
        .set("Authorization", `Bearer ${tokenA}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].rating).toBe(5);
    });
  });

  // ── Favorites ──
  describe("Favorites", () => {
    const OTHER_WORKER_ID = "20000000-0000-4000-8000-000000000002";

    it("POST /favorites/:workerId returns 401 without JWT", async () => {
      await request(app.getHttpServer())
        .post(`/favorites/${WORKER_PROFILE_ID}`)
        .expect(401);
    });

    it("POST /favorites/:workerId returns 403 for WORKER role", async () => {
      const token = generateToken(WORKER);
      await request(app.getHttpServer())
        .post(`/favorites/${WORKER_PROFILE_ID}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(403);
    });

    it("POST /favorites/:workerId creates favorite", async () => {
      const token = generateToken(TOURIST_A);
      const res = await request(app.getHttpServer())
        .post(`/favorites/${WORKER_PROFILE_ID}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(201);

      expect(res.body.data.workerProfileId).toBe(WORKER_PROFILE_ID);
      expect(res.body.data.touristUserId).toBe(TOURIST_A.sub);

      // Check outbox event
      const events = await prisma.outboxEvent.findMany({
        where: { eventName: "favorite.added.v1" },
      });
      expect(events).toHaveLength(1);
      expect(events[0].payload).toHaveProperty("favoriteId");
      expect(events[0].payload).toHaveProperty("workerProfileId", WORKER_PROFILE_ID);
    });

    it("POST /favorites/:workerId returns 409 for duplicate", async () => {
      const token = generateToken(TOURIST_A);
      await request(app.getHttpServer())
        .post(`/favorites/${WORKER_PROFILE_ID}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(201);

      await request(app.getHttpServer())
        .post(`/favorites/${WORKER_PROFILE_ID}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(409);
    });

    it("POST /favorites/:workerId returns 404 for non-existent worker", async () => {
      const token = generateToken(TOURIST_A);
      await request(app.getHttpServer())
        .post(`/favorites/${OTHER_WORKER_ID}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });

    it("GET /favorites returns empty array if no favorites", async () => {
      const token = generateToken(TOURIST_A);
      const res = await request(app.getHttpServer())
        .get("/favorites")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);
    });

    it("GET /favorites returns favorites grouped by beach", async () => {
      const token = generateToken(TOURIST_A);

      // Create a review to have a rating
      await request(app.getHttpServer())
        .post("/reviews")
        .set("Authorization", `Bearer ${token}`)
        .send({ workerProfileId: WORKER_PROFILE_ID, rating: 4 })
        .expect(201);

      // Add favorite
      await request(app.getHttpServer())
        .post(`/favorites/${WORKER_PROFILE_ID}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(201);

      const res = await request(app.getHttpServer())
        .get("/favorites")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].beach).toBe("Porto de Galinhas");
      expect(res.body.data[0].favorites).toHaveLength(1);
      expect(res.body.data[0].favorites[0].worker.name).toBe("Barraca do João");
      expect(res.body.data[0].favorites[0].worker.category).toBe("Alimentação");
      expect(res.body.data[0].favorites[0].worker.beach).toBe("Porto de Galinhas");
      expect(res.body.data[0].favorites[0].rating).toBe(4);
      expect(res.body.meta.total).toBe(1);
    });

    it("DELETE /favorites/:id removes favorite", async () => {
      const token = generateToken(TOURIST_A);

      const createRes = await request(app.getHttpServer())
        .post(`/favorites/${WORKER_PROFILE_ID}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(201);

      const favoriteId = createRes.body.data.id;

      await request(app.getHttpServer())
        .delete(`/favorites/${favoriteId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);

      // Check outbox event for removal
      const events = await prisma.outboxEvent.findMany({
        where: { eventName: "favorite.removed.v1" },
      });
      expect(events).toHaveLength(1);
      expect(events[0].payload).toHaveProperty("favoriteId", favoriteId);

      // Verify it's gone
      const listRes = await request(app.getHttpServer())
        .get("/favorites")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(listRes.body.data).toEqual([]);
    });

    it("DELETE /favorites/:id returns 403 for non-owner", async () => {
      const tokenA = generateToken(TOURIST_A);
      const tokenB = generateToken(TOURIST_B);

      const createRes = await request(app.getHttpServer())
        .post(`/favorites/${WORKER_PROFILE_ID}`)
        .set("Authorization", `Bearer ${tokenA}`)
        .expect(201);

      const favoriteId = createRes.body.data.id;

      await request(app.getHttpServer())
        .delete(`/favorites/${favoriteId}`)
        .set("Authorization", `Bearer ${tokenB}`)
        .expect(403);
    });

    it("DELETE /favorites/:id returns 404 if not found", async () => {
      const token = generateToken(TOURIST_A);
      await request(app.getHttpServer())
        .delete("/favorites/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);
    });
  });
});
