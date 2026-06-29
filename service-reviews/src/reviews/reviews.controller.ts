import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { Request } from "express";
import { ReviewsService } from "./reviews.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { ModerateReviewDto } from "./dto/moderate-review.dto";
import { CreateReportDto } from "./dto/create-report.dto";
import { ListReviewsQueryDto } from "./dto/list-reviews-query.dto";
import { JwtAuthGuard } from "../common/auth/jwt-auth.guard";
import { RolesGuard } from "../common/auth/roles.guard";
import { Roles } from "../common/auth/roles.decorator";
import { CurrentUser } from "../common/auth/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";

@ApiTags("Reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("TOURIST")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a review" })
  @ApiResponse({ status: 201, description: "Review created" })
  @ApiResponse({ status: 400, description: "Validation error" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Worker profile not found" })
  @ApiResponse({ status: 409, description: "Review already exists" })
  async create(
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const review = await this.reviewsService.create(dto, user);
    return {
      data: review,
      meta: { requestId: req.headers["x-correlation-id"] as string },
    };
  }

  @Get("worker/:workerProfileId")
  @ApiOperation({ summary: "List reviews for a worker profile" })
  @ApiParam({ name: "workerProfileId", description: "Worker profile UUID" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Paginated reviews" })
  async list(
    @Param("workerProfileId") workerProfileId: string,
    @Query() query: ListReviewsQueryDto,
    @Req() req: Request,
  ) {
    const result = await this.reviewsService.list(workerProfileId, query);
    return {
      ...result,
      meta: {
        ...result.meta,
        requestId: req.headers["x-correlation-id"] as string,
      },
    };
  }

  @Get("worker/:workerProfileId/summary")
  @ApiOperation({ summary: "Get review summary for a worker profile" })
  @ApiParam({ name: "workerProfileId", description: "Worker profile UUID" })
  async summary(
    @Param("workerProfileId") workerProfileId: string,
    @Req() req: Request,
  ) {
    const result = await this.reviewsService.summary(workerProfileId);
    return {
      ...result,
      meta: { requestId: req.headers["x-correlation-id"] as string },
    };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("TOURIST")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update own review" })
  @ApiParam({ name: "id", description: "Review UUID" })
  @ApiResponse({ status: 200, description: "Review updated" })
  @ApiResponse({ status: 403, description: "Not the author" })
  @ApiResponse({ status: 404, description: "Review not found" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const review = await this.reviewsService.update(id, dto, user);
    return {
      data: review,
      meta: { requestId: req.headers["x-correlation-id"] as string },
    };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("TOURIST")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove own review (soft delete)" })
  @ApiParam({ name: "id", description: "Review UUID" })
  @ApiResponse({ status: 200, description: "Review removed" })
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const review = await this.reviewsService.remove(id, user);
    return {
      data: review,
      meta: { requestId: req.headers["x-correlation-id"] as string },
    };
  }

  @Patch(":id/moderation")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("CURATOR")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Moderate a review (curator)" })
  @ApiParam({ name: "id", description: "Review UUID" })
  @ApiResponse({ status: 200, description: "Review moderated" })
  async moderate(
    @Param("id") id: string,
    @Body() dto: ModerateReviewDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const review = await this.reviewsService.moderate(id, dto, user);
    return {
      data: review,
      meta: { requestId: req.headers["x-correlation-id"] as string },
    };
  }

  @Post(":id/reports")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("TOURIST", "WORKER")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Report a review" })
  @ApiParam({ name: "id", description: "Review UUID" })
  @ApiResponse({ status: 201, description: "Report created" })
  @ApiResponse({ status: 409, description: "Already reported" })
  async report(
    @Param("id") id: string,
    @Body() dto: CreateReportDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const report = await this.reviewsService.report(id, dto, user);
    return {
      data: report,
      meta: { requestId: req.headers["x-correlation-id"] as string },
    };
  }
}
