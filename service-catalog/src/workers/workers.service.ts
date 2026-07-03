import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { MessagingService } from "../messaging/messaging.service";
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly messaging?: MessagingService,
  ) {}

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
      return profile;
    }

    // Non-owner / unauthenticated can only see APPROVED
    if (profile.status === "APPROVED") {
      return profile;
    }

    return null;
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
}
