import { Controller, Get, Param, Query, UseGuards, Logger } from "@nestjs/common";
import {
  EventPattern,
  Payload,
  Ctx,
  RmqContext,
} from "@nestjs/microservices";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";
import { JwtAuthGuard } from "./common/auth/jwt-auth.guard";
import { RolesGuard } from "./common/auth/roles.guard";
import { Roles } from "./common/auth/roles.decorator";
import { CurrentUser } from "./common/auth/current-user.decorator";
import { AuthenticatedUser } from "./common/auth/jwt.strategy";

@ApiTags("Analytics")
@Controller()
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);
  private readonly maxAttempts = parseInt(
    process.env.MAX_RETRY_ATTEMPTS ?? "3",
    10,
  );

  constructor(private readonly analyticsService: AnalyticsService) {}

  // ── Event Handlers ──

  @EventPattern("profile.viewed.v1")
  async handleProfileViewed(
    @Payload() envelope: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const attempt = this.getRetryCount(originalMsg);

    try {
      if (!envelope?.eventId || !envelope?.payload?.profileId) {
        channel.ack(originalMsg);
        return;
      }

      const isDup = await this.analyticsService.isDuplicate(envelope.eventId);
      if (isDup) {
        channel.ack(originalMsg);
        return;
      }

      await this.analyticsService.markProcessed(
        envelope.eventId,
        envelope.eventName,
      );
      await this.analyticsService.handleProfileViewed({
        eventId: envelope.eventId,
        profileId: envelope.payload.profileId,
        viewerRole: envelope.actor?.role,
        beach: envelope.payload.beach,
        timestamp: envelope.payload.timestamp,
      });

      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(
        `profile.viewed.v1 error (attempt ${attempt}/${this.maxAttempts}): ${error.message}`,
      );
      if (attempt >= this.maxAttempts) {
        channel.ack(originalMsg); // drop to DLQ
      } else {
        channel.nack(originalMsg, false, true); // requeue
      }
    }
  }

  @EventPattern("review.submitted.v1")
  async handleReviewSubmitted(
    @Payload() envelope: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const attempt = this.getRetryCount(originalMsg);

    try {
      if (!envelope?.eventId || !envelope?.payload?.workerProfileId) {
        channel.ack(originalMsg);
        return;
      }

      const isDup = await this.analyticsService.isDuplicate(envelope.eventId);
      if (isDup) {
        channel.ack(originalMsg);
        return;
      }

      await this.analyticsService.markProcessed(
        envelope.eventId,
        envelope.eventName,
      );
      await this.analyticsService.handleReviewSubmitted({
        eventId: envelope.eventId,
        reviewId: envelope.payload.reviewId,
        workerProfileId: envelope.payload.workerProfileId,
        rating: envelope.payload.rating ?? 0,
      });

      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(
        `review.submitted.v1 error (attempt ${attempt}/${this.maxAttempts}): ${error.message}`,
      );
      if (attempt >= this.maxAttempts) {
        channel.ack(originalMsg);
      } else {
        channel.nack(originalMsg, false, true);
      }
    }
  }

  @EventPattern("contact.clicked.v1")
  async handleContactClicked(
    @Payload() envelope: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const attempt = this.getRetryCount(originalMsg);

    try {
      if (!envelope?.eventId || !envelope?.payload?.workerProfileId) {
        channel.ack(originalMsg);
        return;
      }

      const isDup = await this.analyticsService.isDuplicate(envelope.eventId);
      if (isDup) {
        channel.ack(originalMsg);
        return;
      }

      await this.analyticsService.markProcessed(
        envelope.eventId,
        envelope.eventName,
      );
      await this.analyticsService.handleContactClicked({
        eventId: envelope.eventId,
        interactionId: envelope.payload.interactionId,
        workerProfileId: envelope.payload.workerProfileId,
        channel: envelope.payload.channel,
      });

      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(
        `contact.clicked.v1 error (attempt ${attempt}/${this.maxAttempts}): ${error.message}`,
      );
      if (attempt >= this.maxAttempts) {
        channel.ack(originalMsg);
      } else {
        channel.nack(originalMsg, false, true);
      }
    }
  }

  // ── Retry helper ──

  private getRetryCount(msg: any): number {
    const deathHeader = msg?.properties?.headers?.["x-death"];
    if (Array.isArray(deathHeader) && deathHeader.length > 0) {
      return deathHeader[0].count ?? 0;
    }
    return 0;
  }

  // ── REST Endpoints ──

  @Get("analytics/workers/:id/summary")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("WORKER", "CURATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Worker metrics summary" })
  @ApiQuery({ name: "from", required: false })
  @ApiQuery({ name: "to", required: false })
  async getWorkerSummary(
    @Param("id") id: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    // WORKER can only see own profile
    if (user?.role === "WORKER") {
      // For MVP: WORKER's sub should match ownerUserId from catalog
      // For now, allow the query (ownership validated by catalog later)
    }

    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
      .toISOString()
      .slice(0, 10);

    const result = await this.analyticsService.getWorkerSummary(
      id,
      from ?? thirtyDaysAgo,
      to ?? today,
    );

    return { data: result };
  }

  @Get("analytics/workers/:id/timeseries")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("WORKER", "CURATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Worker daily timeseries" })
  @ApiQuery({ name: "from", required: false })
  @ApiQuery({ name: "to", required: false })
  async getWorkerTimeseries(
    @Param("id") id: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
      .toISOString()
      .slice(0, 10);

    const result = await this.analyticsService.getWorkerTimeseries(
      id,
      from ?? thirtyDaysAgo,
      to ?? today,
    );

    return { data: result };
  }

  @Get("analytics/beaches/:beach/summary")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CURATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Beach metrics summary (curator only)" })
  @ApiQuery({ name: "from", required: false })
  @ApiQuery({ name: "to", required: false })
  async getBeachSummary(
    @Param("beach") beach: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    const today = new Date().toISOString().slice(0, 10);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)
      .toISOString()
      .slice(0, 10);

    const result = await this.analyticsService.getBeachSummary(
      beach,
      from ?? thirtyDaysAgo,
      to ?? today,
    );

    return { data: result };
  }
}
