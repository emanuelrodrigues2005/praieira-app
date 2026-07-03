import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { authHeader, testUsers } from "./helpers/auth-helper";
import { cleanDatabase } from "./helpers/db-helper";

// ── Test setup ──

function buildApp(moduleFixture: TestingModule) {
  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("Praieira App — Catalog & Geo Service")
    .setDescription("Perfil comercial, serviços, geolocalização e busca.")
    .setVersion("0.1.0")
    .addBearerAuth()
    .addTag("Health")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  return app;
}

describe("WorkerProfile CRUD (e2e) — real DB", () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = buildApp(moduleFixture);
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
  });

  // ── Bullet 1: Create draft profile ──

  describe("POST /catalog/workers", () => {
    const validPayload = {
      name: "Barraca do João",
      description: "Melhor peixe frito da praia",
      category: "barraqueiro",
      phone: "5581999999999",
      whatsapp: "5581999999999",
      latitude: -8.25,
      longitude: -35.0,
      beach: "Gaibu",
    };

    it("should create a profile with status DRAFT for WORKER token (201)", async () => {
      const res = await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.worker))
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.status).toBe("DRAFT");
      expect(res.body.data.ownerUserId).toBe(testUsers.worker.sub);
      expect(res.body.data.name).toBe("Barraca do João");
      expect(res.body.data.beach).toBe("Gaibu");
      expect(res.body.data.latitude).toBe(-8.25);
      expect(res.body.data.longitude).toBe(-35.0);
      expect(res.body).toHaveProperty("meta");
      expect(res.body.meta).toHaveProperty("requestId");
    });

    it("should reject TOURIST with 403", async () => {
      const res = await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.tourist))
        .send(validPayload);

      expect(res.status).toBe(403);
    });

    it("should reject CURATOR with 403", async () => {
      const res = await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.curator))
        .send(validPayload);

      expect(res.status).toBe(403);
    });

    it("should reject unauthenticated request with 401", async () => {
      const res = await request(app.getHttpServer())
        .post("/catalog/workers")
        .send(validPayload);

      expect(res.status).toBe(401);
    });
  });

  // ── Bullet 3: List own profiles ──

  describe("GET /catalog/workers/me", () => {
    it("should return only profiles owned by the authenticated worker", async () => {
      // Create 2 profiles as WORKER A
      await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.worker))
        .send({ name: "Profile A1", category: "barraqueiro", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

      await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.worker))
        .send({ name: "Profile A2", category: "bugueiro", latitude: -8.26, longitude: -35.01, beach: "Porto de Galinhas" });

      // Create 1 profile as WORKER B
      await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.worker2))
        .send({ name: "Profile B1", category: "artesão", latitude: -8.27, longitude: -35.02, beach: "Boa Viagem" });

      const res = await request(app.getHttpServer())
        .get("/catalog/workers/me")
        .set(authHeader(testUsers.worker));

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data.map((p: any) => p.name)).toEqual(
        expect.arrayContaining(["Profile A1", "Profile A2"]),
      );
    });

    it("should return empty array when worker has no profiles", async () => {
      const res = await request(app.getHttpServer())
        .get("/catalog/workers/me")
        .set(authHeader(testUsers.worker2));

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it("should reject unauthenticated request with 401", async () => {
      const res = await request(app.getHttpServer())
        .get("/catalog/workers/me");

      expect(res.status).toBe(401);
    });
  });

  // ── Bullet 4: View detail as owner ──

  describe("GET /catalog/workers/:id (owner)", () => {
    it("should return own profile with status DRAFT when viewed by owner", async () => {
      const createRes = await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.worker))
        .send({ name: "My Draft", category: "barraqueiro", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

      const profileId = createRes.body.data.id;

      const res = await request(app.getHttpServer())
        .get(`/catalog/workers/${profileId}`)
        .set(authHeader(testUsers.worker));

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(profileId);
      expect(res.body.data.status).toBe("DRAFT");
      expect(res.body.data.name).toBe("My Draft");
    });

    it("should return own profile with any status when viewed by owner", async () => {
      const createRes = await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.worker))
        .send({ name: "Status Test", category: "barraqueiro", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

      const profileId = createRes.body.data.id;

      await prismaService.workerProfile.update({
        where: { id: profileId },
        data: { status: "PENDING" },
      });

      const res = await request(app.getHttpServer())
        .get(`/catalog/workers/${profileId}`)
        .set(authHeader(testUsers.worker));

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("PENDING");
    });
  });

  // ── Bullet 5: View detail as non-owner (public rules) ──

  describe("GET /catalog/workers/:id (public)", () => {
    it("should return APPROVED profile to unauthenticated user", async () => {
      const createRes = await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.worker))
        .send({ name: "Public Profile", category: "barraqueiro", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

      const profileId = createRes.body.data.id;
      await prismaService.workerProfile.update({
        where: { id: profileId },
        data: { status: "APPROVED" },
      });

      const res = await request(app.getHttpServer())
        .get(`/catalog/workers/${profileId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Public Profile");
      expect(res.body.data.status).toBe("APPROVED");
    });

    it("should return 404 for DRAFT profile when viewed by unauthenticated user", async () => {
      const createRes = await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.worker))
        .send({ name: "Hidden Draft", category: "barraqueiro", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

      const profileId = createRes.body.data.id;

      const res = await request(app.getHttpServer())
        .get(`/catalog/workers/${profileId}`);

      expect(res.status).toBe(404);
    });

    it("should return 404 for DRAFT profile when viewed by another worker", async () => {
      const createRes = await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.worker))
        .send({ name: "Hidden Draft", category: "barraqueiro", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

      const profileId = createRes.body.data.id;

      const res = await request(app.getHttpServer())
        .get(`/catalog/workers/${profileId}`)
        .set(authHeader(testUsers.worker2));

      expect(res.status).toBe(404);
    });

    it("should return APPROVED profile when viewed by another worker", async () => {
      const createRes = await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.worker))
        .send({ name: "Public Profile", category: "barraqueiro", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

      const profileId = createRes.body.data.id;
      await prismaService.workerProfile.update({
        where: { id: profileId },
        data: { status: "APPROVED" },
      });

      const res = await request(app.getHttpServer())
        .get(`/catalog/workers/${profileId}`)
        .set(authHeader(testUsers.worker2));

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Public Profile");
    });

    it("should return 404 for non-existent profile", async () => {
      const res = await request(app.getHttpServer())
        .get("/catalog/workers/nonexistent-id-12345");

      expect(res.status).toBe(404);
    });
  });

  // ── Bullet 6: Edit profile as owner ──

  describe("PATCH /catalog/workers/:id", () => {
    it("should update DRAFT profile fields when edited by owner", async () => {
      const createRes = await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.worker))
        .send({ name: "Original Name", category: "barraqueiro", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

      const profileId = createRes.body.data.id;

      const res = await request(app.getHttpServer())
        .patch(`/catalog/workers/${profileId}`)
        .set(authHeader(testUsers.worker))
        .send({ name: "Updated Name", description: "Updated description" });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Updated Name");
      expect(res.body.data.description).toBe("Updated description");
    });

    it("should update REJECTED profile when edited by owner", async () => {
      const createRes = await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.worker))
        .send({ name: "Rejected Profile", category: "barraqueiro", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

      const profileId = createRes.body.data.id;
      await prismaService.workerProfile.update({
        where: { id: profileId },
        data: { status: "REJECTED" },
      });

      const res = await request(app.getHttpServer())
        .patch(`/catalog/workers/${profileId}`)
        .set(authHeader(testUsers.worker))
        .send({ name: "Fixed After Rejection" });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe("Fixed After Rejection");
    });

    it("should reject edit from non-owner with 403", async () => {
      const createRes = await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.worker))
        .send({ name: "Worker 1 Profile", category: "barraqueiro", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

      const profileId = createRes.body.data.id;

      const res = await request(app.getHttpServer())
        .patch(`/catalog/workers/${profileId}`)
        .set(authHeader(testUsers.worker2))
        .send({ name: "Hacked Name" });

      expect(res.status).toBe(403);
    });

    it("should return 404 for non-existent profile", async () => {
      const res = await request(app.getHttpServer())
        .patch("/catalog/workers/nonexistent-id")
        .set(authHeader(testUsers.worker))
        .send({ name: "New Name" });

      expect(res.status).toBe(404);
    });

    it("should return 409 when editing PENDING profile", async () => {
      const createRes = await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.worker))
        .send({ name: "Pending Profile", category: "barraqueiro", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

      const profileId = createRes.body.data.id;
      await prismaService.workerProfile.update({
        where: { id: profileId },
        data: { status: "PENDING" },
      });

      const res = await request(app.getHttpServer())
        .patch(`/catalog/workers/${profileId}`)
        .set(authHeader(testUsers.worker))
        .send({ name: "Try Edit" });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("CONFLICT");
    });

    it("should return 409 when editing APPROVED profile", async () => {
      const createRes = await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.worker))
        .send({ name: "Approved Profile", category: "barraqueiro", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

      const profileId = createRes.body.data.id;
      await prismaService.workerProfile.update({
        where: { id: profileId },
        data: { status: "APPROVED" },
      });

      const res = await request(app.getHttpServer())
        .patch(`/catalog/workers/${profileId}`)
        .set(authHeader(testUsers.worker))
        .send({ name: "Try Edit" });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("CONFLICT");
    });
  });

  // ── Bullet 8: Delete profile ──

  describe("DELETE /catalog/workers/:id", () => {
    it("should delete own DRAFT profile and return 204", async () => {
      const createRes = await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.worker))
        .send({ name: "To Delete", category: "barraqueiro", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

      const profileId = createRes.body.data.id;

      const delRes = await request(app.getHttpServer())
        .delete(`/catalog/workers/${profileId}`)
        .set(authHeader(testUsers.worker));

      expect(delRes.status).toBe(204);

      // Verify it's gone
      const getRes = await request(app.getHttpServer())
        .get(`/catalog/workers/${profileId}`)
        .set(authHeader(testUsers.worker));

      expect(getRes.status).toBe(404);
    });

    it("should reject delete from non-owner with 403", async () => {
      const createRes = await request(app.getHttpServer())
        .post("/catalog/workers")
        .set(authHeader(testUsers.worker))
        .send({ name: "Not Mine", category: "barraqueiro", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

      const profileId = createRes.body.data.id;

      const res = await request(app.getHttpServer())
        .delete(`/catalog/workers/${profileId}`)
        .set(authHeader(testUsers.worker2));

      expect(res.status).toBe(403);
    });

    it("should return 404 for non-existent profile", async () => {
      const res = await request(app.getHttpServer())
        .delete("/catalog/workers/nonexistent-id")
        .set(authHeader(testUsers.worker));

      expect(res.status).toBe(404);
    });
  });
});

// ── Bullet 9: Profile viewed event emission ──

describe("Profile Viewed Event (e2e)", () => {
  let app: INestApplication;
  let prismaService: PrismaService;

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
  });

  it("should return 200 when viewing APPROVED profile as TOURIST (event is fire-and-forget)", async () => {
    const createRes = await request(app.getHttpServer())
      .post("/catalog/workers")
      .set(authHeader(testUsers.worker))
      .send({ name: "View Test", category: "barraqueiro", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

    const profileId = createRes.body.data.id;
    await prismaService.workerProfile.update({
      where: { id: profileId },
      data: { status: "APPROVED" },
    });

    const res = await request(app.getHttpServer())
      .get(`/catalog/workers/${profileId}`)
      .set(authHeader(testUsers.tourist));

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("View Test");
  });

  it("should return 200 when viewing APPROVED profile unauthenticated (event is fire-and-forget)", async () => {
    const createRes = await request(app.getHttpServer())
      .post("/catalog/workers")
      .set(authHeader(testUsers.worker))
      .send({ name: "Public View", category: "barraqueiro", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });

    const profileId = createRes.body.data.id;
    await prismaService.workerProfile.update({
      where: { id: profileId },
      data: { status: "APPROVED" },
    });

    const res = await request(app.getHttpServer())
      .get(`/catalog/workers/${profileId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Public View");
  });
});
