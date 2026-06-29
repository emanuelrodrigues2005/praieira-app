import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Logger,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import {
  EventPattern,
  Payload,
  Ctx,
  RmqContext,
} from "@nestjs/microservices";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
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

    try {
      if (!envelope?.eventId || !envelope?.payload?.workerProfileId) {
        this.logger.warn("Invalid profile.viewed.v1 envelope, rejecting");
        channel.nack(originalMsg, false, false); // reject, no requeue
        return;
      }

      const isDup = await this.analyticsService.isDuplicate(envelope.eventId);
      if (isDup) {
        channel.ack(originalMsg);
        return;
      }

      await this.analyticsService.handleProfileViewed({
        eventId: envelope.eventId,
        workerProfileId: envelope.payload.workerProfileId,
        viewerUserId: envelope.payload.viewerUserId,
        viewerRole: envelope.payload.viewerRole,
        beach: envelope.payload.beach,
        viewedAt: envelope.payload.viewedAt,
      });

      await this.analyticsService.markProcessed(
        envelope.eventId,
        envelope.eventName,
      );
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(
        `profile.viewed.v1 error: ${error.message} (eventId=${envelope?.eventId})`,
      );
      channel.nack(originalMsg, false, true);
    }
  }

  @EventPattern("review.submitted.v1")
  async handleReviewSubmitted(
    @Payload() envelope: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      if (!envelope?.eventId || !envelope?.payload?.workerProfileId) {
        channel.nack(originalMsg, false, false);
        return;
      }

      const isDup = await this.analyticsService.isDuplicate(envelope.eventId);
      if (isDup) {
        channel.ack(originalMsg);
        return;
      }

      await this.analyticsService.handleReviewSubmitted({
        eventId: envelope.eventId,
        workerProfileId: envelope.payload.workerProfileId,
        rating: envelope.payload.rating ?? 0,
        submittedAt: envelope.payload.submittedAt,
      });

      await this.analyticsService.markProcessed(
        envelope.eventId,
        envelope.eventName,
      );
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(
        `review.submitted.v1 error: ${error.message} (eventId=${envelope?.eventId})`,
      );
      channel.nack(originalMsg, false, true);
    }
  }

  @EventPattern("review.updated.v1")
  async handleReviewUpdated(
    @Payload() envelope: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      if (!envelope?.eventId || !envelope?.payload?.workerProfileId) {
        channel.nack(originalMsg, false, false);
        return;
      }

      const isDup = await this.analyticsService.isDuplicate(envelope.eventId);
      if (isDup) {
        channel.ack(originalMsg);
        return;
      }

      await this.analyticsService.handleReviewUpdated({
        eventId: envelope.eventId,
        workerProfileId: envelope.payload.workerProfileId,
        previousRating: envelope.payload.previousRating ?? 0,
        rating: envelope.payload.rating ?? 0,
        previousStatus: envelope.payload.previousStatus ?? "PUBLISHED",
        status: envelope.payload.status ?? "PUBLISHED",
        updatedAt: envelope.payload.updatedAt,
      });

      await this.analyticsService.markProcessed(
        envelope.eventId,
        envelope.eventName,
      );
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(
        `review.updated.v1 error: ${error.message} (eventId=${envelope?.eventId})`,
      );
      channel.nack(originalMsg, false, true);
    }
  }

  @EventPattern("review.removed.v1")
  async handleReviewRemoved(
    @Payload() envelope: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      if (!envelope?.eventId || !envelope?.payload?.workerProfileId) {
        channel.nack(originalMsg, false, false);
        return;
      }

      const isDup = await this.analyticsService.isDuplicate(envelope.eventId);
      if (isDup) {
        channel.ack(originalMsg);
        return;
      }

      await this.analyticsService.handleReviewRemoved({
        eventId: envelope.eventId,
        workerProfileId: envelope.payload.workerProfileId,
        rating: envelope.payload.rating ?? 0,
        previousStatus: envelope.payload.previousStatus ?? "PUBLISHED",
        removedAt: envelope.payload.removedAt,
      });

      await this.analyticsService.markProcessed(
        envelope.eventId,
        envelope.eventName,
      );
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(
        `review.removed.v1 error: ${error.message} (eventId=${envelope?.eventId})`,
      );
      channel.nack(originalMsg, false, true);
    }
  }

  @EventPattern("review.moderated.v1")
  async handleReviewModerated(
    @Payload() envelope: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      if (!envelope?.eventId || !envelope?.payload?.workerProfileId) {
        channel.nack(originalMsg, false, false);
        return;
      }

      const isDup = await this.analyticsService.isDuplicate(envelope.eventId);
      if (isDup) {
        channel.ack(originalMsg);
        return;
      }

      await this.analyticsService.handleReviewModerated({
        eventId: envelope.eventId,
        workerProfileId: envelope.payload.workerProfileId,
        rating: envelope.payload.rating ?? 0,
        previousStatus: envelope.payload.previousStatus ?? "PUBLISHED",
        status: envelope.payload.status ?? "HIDDEN",
        moderatedAt: envelope.payload.moderatedAt,
      });

      await this.analyticsService.markProcessed(
        envelope.eventId,
        envelope.eventName,
      );
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(
        `review.moderated.v1 error: ${error.message} (eventId=${envelope?.eventId})`,
      );
      channel.nack(originalMsg, false, true);
    }
  }

  @EventPattern("contact.clicked.v1")
  async handleContactClicked(
    @Payload() envelope: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      if (!envelope?.eventId || !envelope?.payload?.workerProfileId) {
        channel.nack(originalMsg, false, false);
        return;
      }

      const isDup = await this.analyticsService.isDuplicate(envelope.eventId);
      if (isDup) {
        channel.ack(originalMsg);
        return;
      }

      await this.analyticsService.handleContactClicked({
        eventId: envelope.eventId,
        workerProfileId: envelope.payload.workerProfileId,
        channel: envelope.payload.channel,
        clickedAt: envelope.payload.clickedAt,
      });

      await this.analyticsService.markProcessed(
        envelope.eventId,
        envelope.eventName,
      );
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(
        `contact.clicked.v1 error: ${error.message} (eventId=${envelope?.eventId})`,
      );
      channel.nack(originalMsg, false, true);
    }
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
    // Block WORKER until catalog ownership verification exists
    if (user?.role === "WORKER") {
      throw new ForbiddenException(
        "A verificação de propriedade do perfil ainda não está disponível.",
      );
    }

    this.validateDateRange(from, to);

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
  @Roles("CURATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Worker daily timeseries" })
  @ApiQuery({ name: "from", required: false })
  @ApiQuery({ name: "to", required: false })
  async getWorkerTimeseries(
    @Param("id") id: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    this.validateDateRange(from, to);

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
    this.validateDateRange(from, to);

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

  private validateDateRange(from?: string, to?: string) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (from && !dateRegex.test(from)) {
      throw new BadRequestException("Invalid 'from' date format. Use YYYY-MM-DD.");
    }
    if (to && !dateRegex.test(to)) {
      throw new BadRequestException("Invalid 'to' date format. Use YYYY-MM-DD.");
    }
    if (from && to && from > to) {
      throw new BadRequestException("'from' date must be before or equal to 'to' date.");
    }
  }
}
