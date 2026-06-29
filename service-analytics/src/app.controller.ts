import { Controller, Get, Logger } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";

@ApiTags("Health")
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get("health")
  @ApiOperation({ summary: "Health check with MongoDB status" })
  async health() {
    let mongoStatus = "up";
    try {
      if (this.connection.readyState !== 1) {
        throw new Error("Not connected");
      }
    } catch {
      mongoStatus = "down";
    }

    return {
      status: mongoStatus === "up" ? "ok" : "degraded",
      service: "service-analytics",
      dependencies: {
        mongodb: mongoStatus,
      },
    };
  }
}
