import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "./prisma.service";

describe("PrismaService (integration)", () => {
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = moduleFixture.get(PrismaService);
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  it("should connect to the database and return Prisma version", async () => {
    const result: Array<{ version: string }> =
      await prismaService.$queryRawUnsafe(`SELECT version()`);
    expect(result).toBeDefined();
    expect(result.length).toBe(1);
    expect(result[0].version).toContain("PostgreSQL");
  });

  it("should have the WorkerProfile table accessible", async () => {
    const result: Array<{ table_name: string }> =
      await prismaService.$queryRawUnsafe(
        `SELECT table_name FROM information_schema.tables WHERE table_name = 'worker_profiles'`,
      );
    expect(result.length).toBe(1);
    expect(result[0].table_name).toBe("worker_profiles");
  });
});
