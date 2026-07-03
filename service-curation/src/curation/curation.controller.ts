import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
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
import { CurationService } from "./curation.service";
import { JwtAuthGuard } from "../common/auth/jwt-auth.guard";
import { RolesGuard } from "../common/auth/roles.guard";
import { Roles } from "../common/auth/roles.decorator";
import { CurrentUser } from "../common/auth/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { ApproveRequestDto } from "./dto/approve-request.dto";
import { RejectRequestDto } from "./dto/reject-request.dto";
import { ListRequestsQueryDto } from "./dto/list-requests-query.dto";
import { ListAlertsQueryDto } from "./dto/list-alerts-query.dto";
import { SuccessResponse } from "../common/http/response.interface";
import { CORRELATION_ID_KEY } from "../common/correlation/correlation.middleware";
import { REQUEST } from "@nestjs/core";

@ApiTags("Curation")
@Controller("curation")
export class CurationController {
  private readonly logger = new Logger(CurationController.name);

  constructor(
    private readonly curationService: CurationService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  // ── RMQ Event Listeners ──

  @EventPattern("worker.profile.submitted.v1")
  async handleProfileSubmitted(
    @Payload() envelope: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      if (!envelope?.eventId || !envelope?.payload) {
        this.logger.warn("Invalid worker.profile.submitted.v1 envelope, sending to DLQ");
        channel.nack(originalMsg, false, false);
        return;
      }
      await this.curationService.handleProfileSubmitted(envelope);
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Error processing worker.profile.submitted.v1: ${error.message}`);
      // Requeue if temporary database issue, else send to DLQ
      const isTransient = error.status === undefined || error.status >= 500;
      channel.nack(originalMsg, false, isTransient);
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
      if (!envelope?.eventId || !envelope?.payload) {
        this.logger.warn("Invalid review.submitted.v1 envelope, sending to DLQ");
        channel.nack(originalMsg, false, false);
        return;
      }
      await this.curationService.handleReviewSubmitted(envelope);
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Error processing review.submitted.v1: ${error.message}`);
      const isTransient = error.status === undefined || error.status >= 500;
      channel.nack(originalMsg, false, isTransient);
    }
  }

  // ── REST APIs (CURATOR access only) ──

  @Get("pending")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CURATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List pending curation requests" })
  @ApiResponse({ status: 200, description: "Pending request list" })
  async listPending(@Query() query: ListRequestsQueryDto): Promise<SuccessResponse<any>> {
    const result = await this.curationService.listPending(query);
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

  @Get("history")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CURATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Search historical curation decisions" })
  @ApiResponse({ status: 200, description: "Historical request list" })
  async listHistory(@Query() query: ListRequestsQueryDto): Promise<SuccessResponse<any>> {
    const result = await this.curationService.listHistory(query);
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

  @Get("requests/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CURATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get curation request details with audit history" })
  @ApiResponse({ status: 200, description: "Request detail" })
  async findOne(@Param("id") id: string): Promise<SuccessResponse<any>> {
    const request = await this.curationService.findOne(id);
    return {
      data: request,
      meta: {
        requestId: this.request[CORRELATION_ID_KEY] || "system",
      },
    };
  }

  @Post("requests/:id/approve")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CURATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Approve a worker profile curation request" })
  @ApiResponse({ status: 200, description: "Approved request result" })
  async approve(
    @Param("id") id: string,
    @Body() dto: ApproveRequestDto,
    @CurrentUser() reviewer: AuthenticatedUser,
  ): Promise<SuccessResponse<any>> {
    const result = await this.curationService.approve(id, dto, reviewer);
    return {
      data: result,
      meta: {
        requestId: this.request[CORRELATION_ID_KEY] || "system",
      },
    };
  }

  @Post("requests/:id/reject")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CURATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Reject a worker profile curation request with justification" })
  @ApiResponse({ status: 200, description: "Rejected request result" })
  async reject(
    @Param("id") id: string,
    @Body() dto: RejectRequestDto,
    @CurrentUser() reviewer: AuthenticatedUser,
  ): Promise<SuccessResponse<any>> {
    const result = await this.curationService.reject(id, dto, reviewer);
    return {
      data: result,
      meta: {
        requestId: this.request[CORRELATION_ID_KEY] || "system",
      },
    };
  }

  @Get("alerts")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CURATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List moderation alerts" })
  @ApiResponse({ status: 200, description: "Moderation alerts list" })
  async listAlerts(@Query() query: ListAlertsQueryDto): Promise<SuccessResponse<any>> {
    const result = await this.curationService.listAlerts(query);
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

  @Patch("alerts/:id/resolve")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CURATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Resolve a moderation alert" })
  @ApiResponse({ status: 200, description: "Resolved alert result" })
  async resolveAlert(@Param("id") id: string): Promise<SuccessResponse<any>> {
    const result = await this.curationService.resolveAlert(id);
    return {
      data: result,
      meta: {
        requestId: this.request[CORRELATION_ID_KEY] || "system",
      },
    };
  }
}
