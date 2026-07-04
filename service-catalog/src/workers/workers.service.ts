import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MessagingService } from "../messaging/messaging.service";
import { OutboxRepository } from "../messaging/outbox.repository";
import { CreateWorkerDto } from "./dto/create-worker.dto";
import { UpdateWorkerDto } from "./dto/update-worker.dto";
import { Prisma } from "@prisma/client";

const workerProfileInclude = {
  services: {
    where: { isAvailable: true },
  },
} satisfies Prisma.WorkerProfileInclude;

@Injectable()
export class WorkersService {
  private readonly logger = new Logger(WorkersService.name);
  private readonly reviewsBaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly messaging?: MessagingService,
    private readonly outboxRepo?: OutboxRepository,
  ) {
    this.reviewsBaseUrl =
      process.env.REVIEWS_URL ?? "http://localhost:3003";
  }

  async create(userId: string, dto: CreateWorkerDto) {
    return this.prisma.workerProfile.create({
      data: {
        ownerUserId: userId,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        phone: dto.phone,
        whatsapp: dto.whatsapp,
        latitude: dto.latitude,
        longitude: dto.longitude,
        beach: dto.beach,
        status: "DRAFT",
        coverImage: dto.coverImage,
        gallery: dto.gallery ?? [],
        tags: dto.tags ?? [],
        businessHours: dto.businessHours ?? undefined,
      },
    });
  }

  async findByOwner(userId: string) {
    return this.prisma.workerProfile.findMany({
      where: { ownerUserId: userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(profileId: string, currentUserId?: string) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { id: profileId },
      include: workerProfileInclude,
    });

    if (!profile) {
      return null;
    }

    // Owner can see any status
    if (currentUserId && profile.ownerUserId === currentUserId) {
      return this.attachRatings(profile);
    }

    // Non-owner / unauthenticated can only see APPROVED
    if (profile.status === "APPROVED") {
      return this.attachRatings(profile);
    }

    return null;
  }

  private async attachRatings(profile: any) {
    try {
      const url = `${this.reviewsBaseUrl}/reviews/worker/${profile.id}/summary`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeout);

      if (response.ok) {
        const body = await response.json();
        const summary = body.data;
        return {
          ...profile,
          averageRating: summary.averageRating ?? 0,
          totalReviews: summary.totalReviews ?? 0,
        };
      }
    } catch (error: any) {
      this.logger.warn(
        `Failed to fetch ratings for profile ${profile.id}: ${error.message}`,
      );
    }

    return { ...profile, averageRating: 0, totalReviews: 0 };
  }

  async update(profileId: string, userId: string, dto: UpdateWorkerDto) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException("Worker profile not found");
    }

    if (profile.ownerUserId !== userId) {
      throw new ForbiddenException("You can only edit your own profile");
    }

    if (profile.status !== "DRAFT" && profile.status !== "REJECTED") {
      throw new ConflictException(
        "Only profiles with status DRAFT or REJECTED can be edited",
      );
    }

    return this.prisma.workerProfile.update({
      where: { id: profileId },
      data: dto,
    });
  }

  async delete(profileId: string, userId: string): Promise<void> {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException("Worker profile not found");
    }

    if (profile.ownerUserId !== userId) {
      throw new ForbiddenException("You can only delete your own profile");
    }

    // Cascade delete is handled by Prisma relation (onDelete: Cascade)
    await this.prisma.workerProfile.delete({
      where: { id: profileId },
    });
  }

  async emitProfileViewed(
    profileId: string,
    beach: string,
    viewerRole: string,
  ): Promise<void> {
    if (!this.messaging) return;
    this.messaging.emitProfileViewed({
      profileId,
      viewerRole,
      beach,
      timestamp: new Date().toISOString(),
    });
  }

  async verifyProfileOwnership(
    profileId: string,
    userId: string,
  ) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundException("Worker profile not found");
    }

    if (profile.ownerUserId !== userId) {
      throw new ForbiddenException("You do not own this profile");
    }

    return profile;
  }

  async submit(
    profileId: string,
    userId: string,
    correlationId: string,
  ) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile || profile.ownerUserId !== userId) {
      throw new NotFoundException("Worker profile not found");
    }

    if (profile.status !== "DRAFT" && profile.status !== "REJECTED") {
      throw new ConflictException(
        "Only profiles with status DRAFT or REJECTED can be submitted for curation",
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.workerProfile.update({
        where: { id: profileId },
        data: { status: "PENDING" },
      });

      if (this.outboxRepo) {
        await this.outboxRepo.create(
          "worker.profile.submitted.v1",
          {
            profileId: profile.id,
            ownerUserId: profile.ownerUserId,
            workerName: profile.name,
            beach: profile.beach,
            category: profile.category,
            submittedAt: new Date().toISOString(),
          },
          correlationId,
          { userId, role: "WORKER" },
        );
      }

      return updated;
    });

    return result;
  }
}
