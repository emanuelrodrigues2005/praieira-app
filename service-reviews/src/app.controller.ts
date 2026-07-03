import { Controller, Get, Logger } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { PrismaService } from "./prisma/prisma.service";

@ApiTags("Health")
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  @ApiOperation({ summary: "Health check with dependencies" })
  async health() {
    const checks: { database: string; rabbitmq: string } = {
      database: "up",
      rabbitmq: "up",
    };

    // Check database
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      checks.database = "down";
    }

    // RabbitMQ check deferred to outbox (degraded if broker unavailable)
    // For now, we don't actively check RMQ — if DB is up, service is "ok" or "degraded"

    const hasDown = Object.values(checks).some((v) => v === "down");

    return {
      status: hasDown ? "degraded" : "ok",
      service: "service-reviews",
      dependencies: checks,
    };
  }
}
