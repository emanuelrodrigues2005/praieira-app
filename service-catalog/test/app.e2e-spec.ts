import { Test, TestingModule } from "@nestjs/testing";
import {
  INestApplication,
  ValidationPipe,
  Controller,
  Post,
  Get,
  Body,
  Module,
  UseGuards,
} from "@nestjs/common";
import { IsString, IsNotEmpty, MinLength } from "class-validator";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { JwtAuthGuard } from "../src/common/auth/jwt-auth.guard";
import { RolesGuard } from "../src/common/auth/roles.guard";
import { Roles } from "../src/common/auth/roles.decorator";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { authHeader, testUsers } from "./helpers/auth-helper";

// ── Test DTO and Controller for validation / auth tests ──

class TestCreateDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;
}

@Controller("_test")
class TestController {
  @Post()
  create(@Body() dto: TestCreateDto) {
    return { data: dto };
  }

  @Get("protected")
  @UseGuards(JwtAuthGuard)
  getProtected() {
    return { data: "secret" };
  }

  @Get("role-protected")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("WORKER")
  getRoleProtected() {
    return { data: "worker-only" };
  }
}

@Module({
  controllers: [TestController],
})
class TestModule {}

// ── Shared helpers ──

const mockPrismaService = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $queryRawUnsafe: jest.fn(),
  $executeRawUnsafe: jest.fn(),
};

function buildTestingModule() {
  return Test.createTestingModule({
    imports: [AppModule, TestModule],
  })
    .overrideProvider(PrismaService)
    .useValue(mockPrismaService)
    .compile();
}

function buildApp(moduleFixture: TestingModule) {
  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger (mirrors main.ts for test visibility)
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

// ── Tests ──

describe("Health (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await buildTestingModule();
    app = buildApp(moduleFixture);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health should return ok status", async () => {
    const res = await request(app.getHttpServer()).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "ok",
      service: "service-catalog",
    });
  });
});

describe("CorrelationMiddleware (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await buildTestingModule();
    app = buildApp(moduleFixture);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should set x-correlation-id on response when not provided", async () => {
    const res = await request(app.getHttpServer()).get("/health");
    expect(res.status).toBe(200);
    expect(res.headers["x-correlation-id"]).toBeDefined();
    expect(typeof res.headers["x-correlation-id"]).toBe("string");
  });

  it("should echo back the x-correlation-id from the request", async () => {
    const correlationId = "my-test-correlation-id";
    const res = await request(app.getHttpServer())
      .get("/health")
      .set("x-correlation-id", correlationId);
    expect(res.status).toBe(200);
    expect(res.headers["x-correlation-id"]).toBe(correlationId);
  });
});

describe("HttpExceptionFilter (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await buildTestingModule();
    app = buildApp(moduleFixture);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should return standardized 404 for unknown routes", async () => {
    const res = await request(app.getHttpServer()).get("/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toHaveProperty("code", "NOT_FOUND");
    expect(res.body.error).toHaveProperty("message");
    expect(res.body).toHaveProperty("meta");
    expect(res.body.meta).toHaveProperty("requestId");
    expect(res.body.meta).toHaveProperty("timestamp");
  });

  it("should return standardized validation error for invalid body", async () => {
    const res = await request(app.getHttpServer())
      .post("/_test")
      .send({ name: "ab" }); // too short, min 3
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toHaveProperty("code", "VALIDATION_ERROR");
    expect(res.body.error).toHaveProperty("message");
    expect(res.body.error).toHaveProperty("details");
    expect(Array.isArray(res.body.error.details)).toBe(true);
    expect(res.body.error.details.length).toBeGreaterThan(0);
    expect(res.body.error.details[0]).toHaveProperty("field");
    expect(res.body.error.details[0]).toHaveProperty("message");
    expect(res.body).toHaveProperty("meta");
    expect(res.body.meta).toHaveProperty("requestId");
    expect(res.body.meta).toHaveProperty("timestamp");
  });
});

describe("JwtAuthGuard (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await buildTestingModule();
    app = buildApp(moduleFixture);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should reject request without token with 401", async () => {
    const res = await request(app.getHttpServer()).get("/_test/protected");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toHaveProperty("code", "UNAUTHORIZED");
  });

  it("should reject request with malformed token with 401", async () => {
    const res = await request(app.getHttpServer())
      .get("/_test/protected")
      .set("Authorization", "Bearer invalid-token");
    expect(res.status).toBe(401);
  });

  it("should accept request with valid token", async () => {
    const res = await request(app.getHttpServer())
      .get("/_test/protected")
      .set(authHeader(testUsers.tourist));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: "secret" });
  });
});

describe("RolesGuard (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await buildTestingModule();
    app = buildApp(moduleFixture);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should reject TOURIST on WORKER-protected route with 403", async () => {
    const res = await request(app.getHttpServer())
      .get("/_test/role-protected")
      .set(authHeader(testUsers.tourist));
    expect(res.status).toBe(403);
    expect(res.body.error).toHaveProperty("code", "FORBIDDEN");
  });

  it("should accept WORKER on WORKER-protected route", async () => {
    const res = await request(app.getHttpServer())
      .get("/_test/role-protected")
      .set(authHeader(testUsers.worker));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: "worker-only" });
  });
});

describe("Swagger (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await buildTestingModule();
    app = buildApp(moduleFixture);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /api should return Swagger JSON", async () => {
    const res = await request(app.getHttpServer()).get("/api-json");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("info");
    expect(res.body.info).toHaveProperty("title", "Praieira App — Catalog & Geo Service");
    expect(res.body).toHaveProperty("openapi");
  });
});
