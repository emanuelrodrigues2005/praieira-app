import { PrismaService } from "../../src/prisma/prisma.service";

export async function cleanDatabase(prisma: PrismaService) {
  await prisma.favorite.deleteMany();
  await prisma.outboxEvent.deleteMany();
  await prisma.report.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.review.deleteMany();
}

export async function disconnectDatabase(prisma: PrismaService) {
  await prisma.$disconnect();
}
