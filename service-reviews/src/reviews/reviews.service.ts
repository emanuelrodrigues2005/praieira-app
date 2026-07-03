import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Inject,
  Logger,
  UnprocessableEntityException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { CATALOG_CLIENT, CatalogClient } from "../catalog/catalog-client.interface";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { ModerateReviewDto } from "./dto/moderate-review.dto";
import { CreateReportDto } from "./dto/create-report.dto";
import { ListReviewsQueryDto } from "./dto/list-reviews-query.dto";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { Prisma } from "@prisma/client";
import { CorrelationService } from "../common/correlation/correlation.service";

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);
  private readonly commentMaxLength: number;
  private readonly editWindowHours: number;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CATALOG_CLIENT) private readonly catalogClient: CatalogClient,
    private readonly correlationService: CorrelationService,
  ) {
    this.commentMaxLength = parseInt(
      process.env.REVIEW_COMMENT_MAX_LENGTH ?? "1000",
      10,
    );
    this.editWindowHours = parseInt(
      process.env.REVIEW_EDIT_WINDOW_HOURS ?? "24",
      10,
    );
  }

  async create(dto: CreateReviewDto, user: AuthenticatedUser) {
    // Trim comment
    const comment = dto.comment?.trim() || null;
    if (comment !== null && comment.length === 0) {
      throw new UnprocessableEntityException("Comment cannot be empty or whitespace only");
    }

    // Validate worker profile exists via catalog
    await this.validateWorkerProfile(dto.workerProfileId);

    const correlationId = this.correlationService.getCorrelationId();

    try {
      const review = await this.prisma.$transaction(async (tx) => {
        const r = await tx.review.create({
          data: {
            workerProfileId: dto.workerProfileId,
            touristUserId: user.sub,
            rating: dto.rating,
            comment,
          },
        });

        await tx.outboxEvent.create({
          data: {
            id: randomUUID(),
            eventName: "review.submitted.v1",
            version: 1,
            occurredAt: new Date(),
            correlationId,
            producer: "service-reviews",
            actor: { userId: user.sub, role: user.role } as any,
            payload: {
              reviewId: r.id,
              workerProfileId: r.workerProfileId,
              touristUserId: r.touristUserId,
              rating: r.rating,
              hasComment: r.comment !== null,
              submittedAt: r.createdAt.toISOString(),
            } as any,
            attempts: 0,
          },
        });

        return r;
      });

      return review;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "You have already reviewed this worker profile",
          );
        }
      }
      throw error;
    }
  }

  async list(workerProfileId: string, query: ListReviewsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      workerProfileId,
      status: "PUBLISHED" as const,
    };

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        select: {
          id: true,
          workerProfileId: true,
          rating: true,
          comment: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async summary(workerProfileId: string) {
    const result = await this.prisma.$queryRawUnsafe<
      Array<{
        averageRating: number;
        totalReviews: bigint;
        rating1: bigint;
        rating2: bigint;
        rating3: bigint;
        rating4: bigint;
        rating5: bigint;
      }>
    >(
      `SELECT
         COALESCE(AVG(rating), 0)::float AS "averageRating",
         COUNT(*)::int AS "totalReviews",
         COUNT(*) FILTER (WHERE rating = 1)::int AS "rating1",
         COUNT(*) FILTER (WHERE rating = 2)::int AS "rating2",
         COUNT(*) FILTER (WHERE rating = 3)::int AS "rating3",
         COUNT(*) FILTER (WHERE rating = 4)::int AS "rating4",
         COUNT(*) FILTER (WHERE rating = 5)::int AS "rating5"
       FROM reviews
       WHERE worker_profile_id = $1
         AND status = 'PUBLISHED'`,
      workerProfileId,
    );

    const row = result[0];
    const totalReviews = Number(row.totalReviews);
    if (totalReviews === 0) {
      return {
        data: {
          workerProfileId,
          averageRating: 0,
          totalReviews: 0,
          distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
        },
      };
    }

    return {
      data: {
        workerProfileId,
        averageRating: Math.round(Number(row.averageRating) * 10) / 10,
        totalReviews,
        distribution: {
          "1": Number(row.rating1),
          "2": Number(row.rating2),
          "3": Number(row.rating3),
          "4": Number(row.rating4),
          "5": Number(row.rating5),
        },
      },
    };
  }

  async update(
    reviewId: string,
    dto: UpdateReviewDto,
    user: AuthenticatedUser,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (review.touristUserId !== user.sub) {
      throw new ForbiddenException("You can only edit your own reviews");
    }

    if (review.status === "REMOVED") {
      throw new UnprocessableEntityException("Cannot edit a removed review");
    }

    // Check edit window
    if (this.editWindowHours > 0) {
      const deadline = new Date(
        review.createdAt.getTime() + this.editWindowHours * 3600000,
      );
      if (new Date() > deadline) {
        throw new ConflictException(
          `Edit window of ${this.editWindowHours} hours has expired`,
        );
      }
    }

    const comment = dto.comment?.trim() || undefined;
    if (comment !== undefined && comment.length === 0) {
      throw new UnprocessableEntityException("Comment cannot be empty or whitespace only");
    }

    const previousRating = review.rating;
    const previousStatus = review.status;

    const correlationId = this.correlationService.getCorrelationId();

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        const r = await tx.review.update({
          where: { id: reviewId },
          data: {
            ...(dto.rating !== undefined && { rating: dto.rating }),
            ...(comment !== undefined && { comment }),
          },
        });

        await tx.outboxEvent.create({
          data: {
            id: randomUUID(),
            eventName: "review.updated.v1",
            version: 1,
            occurredAt: new Date(),
            correlationId,
            producer: "service-reviews",
            actor: { userId: user.sub, role: user.role } as any,
            payload: {
              reviewId: r.id,
              workerProfileId: r.workerProfileId,
              touristUserId: r.touristUserId,
              previousRating,
              rating: r.rating,
              previousStatus,
              status: r.status,
              hasComment: r.comment !== null,
              originalSubmittedAt: r.createdAt.toISOString(),
              updatedAt: r.updatedAt.toISOString(),
            } as any,
            attempts: 0,
          },
        });

        return r;
      });

      return updated;
    } catch (error: any) {
      this.logger.error(`Failed to update review ${reviewId}: ${error.message}`);
      throw error;
    }
  }

  async remove(reviewId: string, user: AuthenticatedUser) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    if (review.touristUserId !== user.sub) {
      throw new ForbiddenException("You can only remove your own reviews");
    }

    if (review.status === "REMOVED") {
      throw new ConflictException("Review is already removed");
    }

    const correlationId = this.correlationService.getCorrelationId();

    return this.prisma.$transaction(async (tx) => {
      const r = await tx.review.update({
        where: { id: reviewId },
        data: {
          status: "REMOVED",
          deletedAt: new Date(),
        },
      });

      await tx.outboxEvent.create({
        data: {
          id: randomUUID(),
          eventName: "review.removed.v1",
          version: 1,
          occurredAt: new Date(),
          correlationId,
          producer: "service-reviews",
          actor: { userId: user.sub, role: user.role } as any,
          payload: {
            reviewId: r.id,
            workerProfileId: r.workerProfileId,
            touristUserId: r.touristUserId,
            rating: r.rating,
            previousStatus: review.status,
            status: "REMOVED",
            originalSubmittedAt: r.createdAt.toISOString(),
            removedAt: r.deletedAt!.toISOString(),
          } as any,
          attempts: 0,
        },
      });

      return r;
    });
  }

  async moderate(
    reviewId: string,
    dto: ModerateReviewDto,
    user: AuthenticatedUser,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    const previousStatus = review.status;
    const status = dto.action === "HIDDEN" ? "HIDDEN" : "REMOVED";
    const correlationId = this.correlationService.getCorrelationId();

    const updated = await this.prisma.$transaction(async (tx) => {
      const r = await tx.review.update({
        where: { id: reviewId },
        data: {
          status,
          moderationReason: dto.reason,
          moderatedByUserId: user.sub,
          moderatedAt: new Date(),
          ...(status === "REMOVED" && { deletedAt: new Date() }),
        },
      });

      await tx.outboxEvent.create({
        data: {
          id: randomUUID(),
          eventName: "review.moderated.v1",
          version: 1,
          occurredAt: new Date(),
          correlationId,
          producer: "service-reviews",
          actor: { userId: user.sub, role: user.role } as any,
          payload: {
            reviewId: r.id,
            workerProfileId: r.workerProfileId,
            rating: r.rating,
            previousStatus,
            status: r.status,
            moderatedByUserId: user.sub,
            reason: dto.reason,
            originalSubmittedAt: r.createdAt.toISOString(),
            moderatedAt: r.moderatedAt!.toISOString(),
          } as any,
          attempts: 0,
        },
      });

      return r;
    });

    return updated;
  }

  async report(
    reviewId: string,
    dto: CreateReportDto,
    user: AuthenticatedUser,
  ) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException("Review not found");
    }

    try {
      const report = await this.prisma.$transaction(async (tx) => {
        const r = await tx.report.create({
          data: {
            reviewId,
            userId: user.sub,
            reason: dto.reason,
            details: dto.details?.trim() || null,
          },
        });

        const correlationId = this.correlationService.getCorrelationId();
        await tx.outboxEvent.create({
          data: {
            id: randomUUID(),
            eventName: "review.reported.v1",
            version: 1,
            occurredAt: new Date(),
            correlationId,
            producer: "service-reviews",
            actor: { userId: user.sub, role: user.role } as any,
            payload: {
              reportId: r.id,
              reviewId,
              workerProfileId: review.workerProfileId,
              reportedByUserId: user.sub,
              reason: dto.reason,
              reportedAt: r.createdAt.toISOString(),
            } as any,
            attempts: 0,
          },
        });

        return r;
      });

      return report;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException(
            "You have already reported this review",
          );
        }
      }
      throw error;
    }
  }

  private async validateWorkerProfile(workerProfileId: string) {
    try {
      const profile =
        await this.catalogClient.getPublicWorkerProfile(workerProfileId);
      if (!profile) {
        throw new NotFoundException("Worker profile not found");
      }
      if (profile.publicationStatus !== "APPROVED") {
        throw new UnprocessableEntityException(
          "Worker profile is not available for reviews",
        );
      }
      if (!profile.isActive) {
        throw new UnprocessableEntityException("Worker profile is not active");
      }
    } catch (error: any) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnprocessableEntityException
      ) {
        throw error;
      }
      this.logger.error(
        `Catalog validation failed for profile ${workerProfileId}: ${error.message}`,
      );
      throw new ServiceUnavailableException(
        "Catalog service unavailable. " +
          "The worker profile could not be validated.",
      );
    }
  }
}
