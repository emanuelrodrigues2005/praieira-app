import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { authHeader, testUsers } from "./helpers/auth-helper";
import { cleanDatabase } from "./helpers/db-helper";

describe("ServiceItem CRUD (e2e) — real DB", () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let profileId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    prismaService = moduleFixture.get(PrismaService);
    await prismaService.$connect();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prismaService.$disconnect();
  });

  beforeEach(async () => {
    await cleanDatabase();
    // Create a profile for the worker to use in tests
    const createRes = await request(app.getHttpServer())
      .post("/catalog/workers")
      .set(authHeader(testUsers.worker))
      .send({ name: "Worker Profile", category: "barraqueiro", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });
    profileId = createRes.body.data.id;
  });

  const validService = {
    title: "Peixe Frito",
    description: "Porção de peixe frito com acompanhamentos",
    price: 25.0,
    category: "comida",
    latitude: -8.25,
    longitude: -35.0,
    beach: "Gaibu",
  };

  // ── Bullet 1: Add service to own profile ──

  describe("POST /catalog/workers/:id/services", () => {
    it("should create a service on own profile and return 201", async () => {
      const res = await request(app.getHttpServer())
        .post(`/catalog/workers/${profileId}/services`)
        .set(authHeader(testUsers.worker))
        .send(validService);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.title).toBe("Peixe Frito");
      expect(res.body.data.category).toBe("comida");
      expect(res.body.data.price).toBe(25.0);
      expect(res.body.data.workerId).toBe(profileId);
      expect(res.body.data.isAvailable).toBe(true);
      expect(res.body).toHaveProperty("meta");
      expect(res.body.meta).toHaveProperty("requestId");
    });

    it("should return 403 when adding service to another worker's profile", async () => {
      const res = await request(app.getHttpServer())
        .post(`/catalog/workers/${profileId}/services`)
        .set(authHeader(testUsers.worker2))
        .send(validService);

      expect(res.status).toBe(403);
    });

    it("should return 404 when adding service to non-existent profile", async () => {
      const res = await request(app.getHttpServer())
        .post("/catalog/workers/nonexistent-id/services")
        .set(authHeader(testUsers.worker))
        .send(validService);

      expect(res.status).toBe(404);
    });
  });

  // ── Bullets 3-4: PATCH service ──

  describe("PATCH /catalog/services/:id", () => {
    let serviceId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post(`/catalog/workers/${profileId}/services`)
        .set(authHeader(testUsers.worker))
        .send(validService);
      serviceId = res.body.data.id;
    });

    it("should update own service and return 200", async () => {
      const res = await request(app.getHttpServer())
        .patch(`/catalog/services/${serviceId}`)
        .set(authHeader(testUsers.worker))
        .send({ title: "Updated Title", price: 30.0 });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Updated Title");
      expect(res.body.data.price).toBe(30.0);
    });

    it("should return 403 when updating another worker's service", async () => {
      const res = await request(app.getHttpServer())
        .patch(`/catalog/services/${serviceId}`)
        .set(authHeader(testUsers.worker2))
        .send({ title: "Hacked Title" });

      expect(res.status).toBe(403);
    });

    it("should return 404 when updating non-existent service", async () => {
      const res = await request(app.getHttpServer())
        .patch("/catalog/services/nonexistent-id")
        .set(authHeader(testUsers.worker))
        .send({ title: "New Title" });

      expect(res.status).toBe(404);
    });
  });

  // ── Bullets 5-6: DELETE service ──

  describe("DELETE /catalog/services/:id", () => {
    let serviceId: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post(`/catalog/workers/${profileId}/services`)
        .set(authHeader(testUsers.worker))
        .send(validService);
      serviceId = res.body.data.id;
    });

    it("should delete own service and return 204", async () => {
      const delRes = await request(app.getHttpServer())
        .delete(`/catalog/services/${serviceId}`)
        .set(authHeader(testUsers.worker));

      expect(delRes.status).toBe(204);
    });

    it("should return 403 when deleting another worker's service", async () => {
      const res = await request(app.getHttpServer())
        .delete(`/catalog/services/${serviceId}`)
        .set(authHeader(testUsers.worker2));

      expect(res.status).toBe(403);
    });

    it("should return 404 when deleting non-existent service", async () => {
      const res = await request(app.getHttpServer())
        .delete("/catalog/services/nonexistent-id")
        .set(authHeader(testUsers.worker));

      expect(res.status).toBe(404);
    });
  });

  // ── Bullet 7: Cascade delete ──

  describe("Cascade delete", () => {
    it("should delete all services when parent profile is deleted", async () => {
      const s1 = await request(app.getHttpServer())
        .post(`/catalog/workers/${profileId}/services`)
        .set(authHeader(testUsers.worker))
        .send({ title: "Service 1", category: "comida", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

      const s2 = await request(app.getHttpServer())
        .post(`/catalog/workers/${profileId}/services`)
        .set(authHeader(testUsers.worker))
        .send({ title: "Service 2", category: "bebida", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

      expect(s1.status).toBe(201);
      expect(s2.status).toBe(201);

      // Delete the profile
      const delRes = await request(app.getHttpServer())
        .delete(`/catalog/workers/${profileId}`)
        .set(authHeader(testUsers.worker));

      expect(delRes.status).toBe(204);

      // Verify services are gone (PATCH returns 404)
      const getS1 = await request(app.getHttpServer())
        .patch(`/catalog/services/${s1.body.data.id}`)
        .set(authHeader(testUsers.worker))
        .send({ title: "Should Not Exist" });

      expect(getS1.status).toBe(404);
    });
  });

  // ── Bullet 8: Validation errors ──

  describe("Validation errors", () => {
    it("should return 400 when title is missing", async () => {
      const res = await request(app.getHttpServer())
        .post(`/catalog/workers/${profileId}/services`)
        .set(authHeader(testUsers.worker))
        .send({ category: "comida", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

      expect(res.status).toBe(400);
    });

    it("should return 400 when latitude is out of range", async () => {
      const res = await request(app.getHttpServer())
        .post(`/catalog/workers/${profileId}/services`)
        .set(authHeader(testUsers.worker))
        .send({ title: "Test", category: "comida", latitude: 100, longitude: -35.0, beach: "Gaibu" });

      expect(res.status).toBe(400);
    });
  });
});
