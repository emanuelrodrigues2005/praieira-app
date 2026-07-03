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
    const checks = {
      database: "up",
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      this.logger.error(`Database health check failed: ${error.message}`);
      checks.database = "down";
    }

    const hasDown = Object.values(checks).some((v) => v === "down");

    return {
      status: hasDown ? "degraded" : "ok",
      service: "service-auth",
      dependencies: checks,
    };
  }
}
