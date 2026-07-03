import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  return prisma;
}

export async function cleanDatabase(): Promise<void> {
  const client = getPrisma();
  await client.$executeRawUnsafe(`DELETE FROM outbox_events`);
  await client.$executeRawUnsafe(`DELETE FROM service_items`);
  await client.$executeRawUnsafe(`DELETE FROM worker_profiles`);
}

export { prisma };
