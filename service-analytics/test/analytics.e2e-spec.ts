import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { getConnectionToken } from "@nestjs/mongoose";

describe("service-analytics (e2e)", () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    process.env.NODE_ENV = "test";
    process.env.MONGO_URL =
      process.env.MONGO_URL ?? "mongodb://localhost:27018/db_analytics_test";
    process.env.JWT_SECRET = "test-jwt-secret";
    process.env.RMQ_URL = "amqp://guest:guest@localhost:5673";
    process.env.RMQ_EXCHANGE = "praieira.events.test";

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    connection = app.get(getConnectionToken());
  });

  afterAll(async () => {
    if (connection) {
      await cleanCollections(connection);
      await connection.close();
    }
    await app.close();
  });

  const ANALYTICS_COLLECTIONS = ["worker_daily_metrics", "profile_views", "processed_events"];

  async function cleanCollections(conn: Connection): Promise<void> {
    for (const name of ANALYTICS_COLLECTIONS) {
      try { await conn.collection(name).deleteMany({}); } catch { /* ok */ }
    }
  }

  // ── Health ──
  describe("GET /health", () => {
    it("returns ok with MongoDB status", async () => {
      const res = await request(app.getHttpServer())
        .get("/health")
        .expect(200);

      expect(res.body.status).toMatch(/ok|degraded/);
      expect(res.body.service).toBe("service-analytics");
      expect(res.body.dependencies.mongodb).toBeDefined();
    });
  });

  // ── Auth ──
  describe("GET /analytics/workers/:id/summary", () => {
    it("returns 401 without JWT", async () => {
      await request(app.getHttpServer())
        .get("/analytics/workers/10000000-0000-4000-8000-000000000001/summary")
        .expect(401);
    });
  });

  // ── WORKER blocked ──
  describe("WORKER access", () => {
    it("returns 403 for WORKER role on worker summary", async () => {
      const { JwtService } = require("@nestjs/jwt");
      const jwt = new JwtService({ secret: "test-jwt-secret" });
      const token = jwt.sign({
        sub: "00000000-0000-4000-8000-000000000003",
        role: "WORKER",
        email: "worker@test.com",
      });

      await request(app.getHttpServer())
        .get("/analytics/workers/10000000-0000-4000-8000-000000000001/summary")
        .set("Authorization", `Bearer ${token}`)
        .expect(403);
    });
  });

  // ── CURATOR access ──
  describe("CURATOR access", () => {
    it("returns 200 for CURATOR on beach summary", async () => {
      const { JwtService } = require("@nestjs/jwt");
      const jwt = new JwtService({ secret: "test-jwt-secret" });
      const token = jwt.sign({
        sub: "00000000-0000-4000-8000-000000000004",
        role: "CURATOR",
        email: "curator@test.com",
      });

      const res = await request(app.getHttpServer())
        .get("/analytics/beaches/GAIBU/summary")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.beach).toBe("GAIBU");
      expect(res.body.data.profileViews).toBeGreaterThanOrEqual(0);
    });
  });

  // ── Date validation ──
  describe("Date validation", () => {
    it("returns 400 for invalid from date", async () => {
      const { JwtService } = require("@nestjs/jwt");
      const jwt = new JwtService({ secret: "test-jwt-secret" });
      const token = jwt.sign({
        sub: "00000000-0000-4000-8000-000000000004",
        role: "CURATOR",
        email: "curator@test.com",
      });

      await request(app.getHttpServer())
        .get("/analytics/beaches/GAIBU/summary?from=invalid")
        .set("Authorization", `Bearer ${token}`)
        .expect(400);
    });

    it("returns 400 when from > to", async () => {
      const { JwtService } = require("@nestjs/jwt");
      const jwt = new JwtService({ secret: "test-jwt-secret" });
      const token = jwt.sign({
        sub: "00000000-0000-4000-8000-000000000004",
        role: "CURATOR",
        email: "curator@test.com",
      });

      await request(app.getHttpServer())
        .get("/analytics/beaches/GAIBU/summary?from=2026-12-31&to=2026-01-01")
        .set("Authorization", `Bearer ${token}`)
        .expect(400);
    });
  });

  // ── Timeseries ──
  describe("GET /analytics/workers/:id/timeseries", () => {
    it("returns empty array for unknown worker (curator)", async () => {
      const { JwtService } = require("@nestjs/jwt");
      const jwt = new JwtService({ secret: "test-jwt-secret" });
      const token = jwt.sign({
        sub: "00000000-0000-4000-8000-000000000004",
        role: "CURATOR",
        email: "curator@test.com",
      });

      const res = await request(app.getHttpServer())
        .get("/analytics/workers/00000000-0000-4000-8000-999999999999/timeseries")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(res.body.data).toEqual([]);
    });
  });
});
