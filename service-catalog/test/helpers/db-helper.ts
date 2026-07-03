import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

export async function cleanDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(`DELETE FROM outbox_events`);
  await prisma.$executeRawUnsafe(`DELETE FROM service_items`);
  await prisma.$executeRawUnsafe(`DELETE FROM worker_profiles`);
}

export { prisma };
