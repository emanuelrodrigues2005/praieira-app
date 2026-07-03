import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { cleanDatabase } from "./helpers/db-helper";

describe("Geospatial Search (e2e)", () => {
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

  async function seedApprovedProfile(overrides: Partial<{
    name: string; description: string | null; category: string; beach: string;
    latitude: number; longitude: number; status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  }> = {}) {
    return prismaService.workerProfile.create({
      data: {
        ownerUserId: "worker-uuid",
        name: overrides.name ?? "Default Name",
        description: overrides.description ?? null,
        category: overrides.category ?? "barraqueiro",
        beach: overrides.beach ?? "Gaibu",
        latitude: overrides.latitude ?? -8.25,
        longitude: overrides.longitude ?? -35.0,
        status: overrides.status ?? "APPROVED",
      },
    });
  }

  // ── Bullet 1: Basic search returns all APPROVED profiles ──

  describe("GET /catalog/search", () => {
    it("should return empty array when no profiles exist", async () => {
      const res = await request(app.getHttpServer()).get("/catalog/search");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.totalPages).toBe(1);
    });

    it("should return all APPROVED profiles when no filters provided", async () => {
      await seedApprovedProfile({ name: "Profile 1" });
      await seedApprovedProfile({ name: "Profile 2" });

      const res = await request(app.getHttpServer()).get("/catalog/search");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta.total).toBe(2);
    });

    it("should NOT return DRAFT, PENDING, or REJECTED profiles", async () => {
      await seedApprovedProfile({ name: "Visible" });
      await seedApprovedProfile({ name: "Hidden Draft", status: "DRAFT" });
      await seedApprovedProfile({ name: "Hidden Pending", status: "PENDING" });
      await seedApprovedProfile({ name: "Hidden Rejected", status: "REJECTED" });

      const res = await request(app.getHttpServer()).get("/catalog/search");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe("Visible");
    });
  });

  // ── Bullets 2-3: Text, beach, category filters ──

  describe("Search filters", () => {
    beforeEach(async () => {
      await seedApprovedProfile({ name: "Barraca do João", description: "Peixe frito delicioso", category: "barraqueiro", beach: "Gaibu", latitude: -8.25, longitude: -35.0 });
      await seedApprovedProfile({ name: "Buggy Tour", description: "Passeio de buggy pelas praias", category: "bugueiro", beach: "Porto de Galinhas", latitude: -8.5, longitude: -35.1 });
      await seedApprovedProfile({ name: "Artesanato Maria", description: "Artesanato em renda", category: "artesão", beach: "Boa Viagem", latitude: -8.1, longitude: -34.9 });
    });

    it("?text should filter by name (ILIKE)", async () => {
      const res = await request(app.getHttpServer()).get("/catalog/search?text=barraca");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe("Barraca do João");
    });

    it("?text should filter by description (ILIKE)", async () => {
      const res = await request(app.getHttpServer()).get("/catalog/search?text=passeio");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe("Buggy Tour");
    });

    it("?text should be case-insensitive", async () => {
      const res = await request(app.getHttpServer()).get("/catalog/search?text=BARRACA");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it("?beach should filter by exact beach name", async () => {
      const res = await request(app.getHttpServer()).get("/catalog/search?beach=Gaibu");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe("Barraca do João");
    });

    it("?category should filter by exact category", async () => {
      const res = await request(app.getHttpServer()).get("/catalog/search?category=artesão");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe("Artesanato Maria");
    });
  });

  // ── Bullet 4: Geo/radius filter ──

  describe("Geo/radius filter", () => {
    beforeEach(async () => {
      await seedApprovedProfile({ name: "Near Gaibu", latitude: -8.25, longitude: -35.0, beach: "Gaibu" });
      await seedApprovedProfile({ name: "Far Away", latitude: -8.5, longitude: -35.1, beach: "Porto de Galinhas" });
    });

    it("?lat&lng&radius should filter by distance", async () => {
      const res = await request(app.getHttpServer()).get("/catalog/search?lat=-8.25&lng=-35.0&radius=5000");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe("Near Gaibu");
    });

    it("should include distance field when geo params provided", async () => {
      const res = await request(app.getHttpServer()).get("/catalog/search?lat=-8.25&lng=-35.0&radius=50000");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0]).toHaveProperty("distance");
      expect(typeof res.body.data[0].distance).toBe("number");
    });

    it("should order by distance ascending", async () => {
      const res = await request(app.getHttpServer()).get("/catalog/search?lat=-8.25&lng=-35.0&radius=50000");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].distance).toBeLessThan(res.body.data[1].distance);
    });
  });

  // ── Bullet 5: Pagination ──

  describe("Pagination", () => {
    beforeEach(async () => {
      for (let i = 1; i <= 5; i++) {
        await seedApprovedProfile({ name: `Profile ${i}` });
      }
    });

    it("?page=2&limit=2 should return the second page with correct metadata", async () => {
      const res = await request(app.getHttpServer()).get("/catalog/search?page=2&limit=2");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta.page).toBe(2);
      expect(res.body.meta.limit).toBe(2);
      expect(res.body.meta.total).toBe(5);
      expect(res.body.meta.totalPages).toBe(3);
    });

    it("?limit=10 should default to page 1 and return all", async () => {
      const res = await request(app.getHttpServer()).get("/catalog/search?limit=10");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(5);
      expect(res.body.meta.page).toBe(1);
    });
  });

  // ── Bullet 6: Validation errors ──

  describe("Validation errors", () => {
    it("should return 400 when lat is provided without lng", async () => {
      const res = await request(app.getHttpServer()).get("/catalog/search?lat=-8.25");
      expect(res.status).toBe(400);
    });

    it("should return 400 when lng is provided without lat", async () => {
      const res = await request(app.getHttpServer()).get("/catalog/search?lng=-35.0");
      expect(res.status).toBe(400);
    });

    it("should return 400 when radius is provided without lat/lng", async () => {
      const res = await request(app.getHttpServer()).get("/catalog/search?radius=5000");
      expect(res.status).toBe(400);
    });
  });

  // ── Bullet 7: Combined filters ──

  describe("Combined filters", () => {
    beforeEach(async () => {
      await seedApprovedProfile({ name: "Barraca do João", description: "Peixe frito", category: "barraqueiro", beach: "Gaibu", latitude: -8.25, longitude: -35.0 });
      await seedApprovedProfile({ name: "Buggy Tour", description: "Passeio de buggy", category: "bugueiro", beach: "Porto de Galinhas", latitude: -8.5, longitude: -35.1 });
    });

    it("?text&beach&category&lat&lng&radius should apply all filters", async () => {
      const res = await request(app.getHttpServer())
        .get("/catalog/search?text=barraca&beach=Gaibu&category=barraqueiro&lat=-8.25&lng=-35.0&radius=10000");
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe("Barraca do João");
    });
  });
});
