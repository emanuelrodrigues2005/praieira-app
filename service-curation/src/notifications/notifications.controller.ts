import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Logger,
  Inject,
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
  ApiResponse,
} from "@nestjs/swagger";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../common/auth/jwt-auth.guard";
import { CurrentUser } from "../common/auth/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { ListNotificationsQueryDto } from "./dto/list-notifications-query.dto";
import { UpdatePreferencesDto } from "./dto/preferences.dto";
import { SuccessResponse } from "../common/http/response.interface";
import { CORRELATION_ID_KEY } from "../common/correlation/correlation.middleware";
import { REQUEST } from "@nestjs/core";

@ApiTags("Notifications")
@Controller("notifications")
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  // ── RMQ Event Listener ──

  @EventPattern("notification.requested.v1")
  async handleNotificationRequested(
    @Payload() envelope: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      if (!envelope?.eventId || !envelope?.payload) {
        this.logger.warn("Invalid notification.requested.v1 envelope, sending to DLQ");
        channel.nack(originalMsg, false, false);
        return;
      }
      await this.notificationsService.handleNotificationRequested(envelope);
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Error processing notification.requested.v1: ${error.message}`);
      const isTransient = error.status === undefined || error.status >= 500;
      channel.nack(originalMsg, false, isTransient);
    }
  }

  // ── REST APIs ──

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List notifications for the logged-in user" })
  @ApiResponse({ status: 200, description: "Notification list" })
  async listForUser(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListNotificationsQueryDto,
  ): Promise<SuccessResponse<any>> {
    const result = await this.notificationsService.listForUser(user.sub, query);
    return {
      data: result.data,
      meta: {
        page: result.meta.page,
        limit: result.meta.limit,
        total: result.meta.total,
        totalPages: result.meta.totalPages,
        requestId: this.request[CORRELATION_ID_KEY] || "system",
      } as any,
    };
  }

  @Get("preferences")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user notification preferences" })
  async getPreferences(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SuccessResponse<any>> {
    const result = await this.notificationsService.getPreferences(user.sub);
    return {
      data: result,
      meta: {
        requestId: this.request[CORRELATION_ID_KEY] || "system",
      },
    };
  }

  @Patch("preferences")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update/merge notification preferences for the logged-in user" })
  async updatePreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePreferencesDto,
  ): Promise<SuccessResponse<any>> {
    const correlationId = this.request[CORRELATION_ID_KEY] || "system";
    const result = await this.notificationsService.updatePreferences(
      user.sub,
      dto,
      correlationId,
    );
    return {
      data: result,
      meta: {
        requestId: correlationId,
      },
    };
  }

  @Patch(":id/read")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mark a notification as read" })
  @ApiResponse({ status: 200, description: "Updated notification" })
  async markAsRead(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SuccessResponse<any>> {
    const result = await this.notificationsService.markAsRead(id, user.sub);
    return {
      data: result,
      meta: {
        requestId: this.request[CORRELATION_ID_KEY] || "system",
      },
    };
  }
}
