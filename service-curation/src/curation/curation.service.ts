import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CorrelationService } from "../common/correlation/correlation.service";
import { ApproveRequestDto } from "./dto/approve-request.dto";
import { RejectRequestDto } from "./dto/reject-request.dto";
import { ListRequestsQueryDto } from "./dto/list-requests-query.dto";
import { ListAlertsQueryDto } from "./dto/list-alerts-query.dto";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { CurationStatus } from "@prisma/client";
import { randomUUID } from "crypto";

@Injectable()
export class CurationService {
  private readonly logger = new Logger(CurationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly correlationService: CorrelationService,
  ) {}

  // ── RMQ Event Consumers ──

  async handleProfileSubmitted(envelope: any): Promise<void> {
    const eventId = envelope.eventId;
    const correlationId = envelope.correlationId || randomUUID();
    const payload = envelope.payload;

    if (!payload?.workerProfileId || !payload?.ownerUserId) {
      this.logger.warn(`Invalid worker.profile.submitted.v1 payload`);
      return;
    }

    const { workerProfileId, ownerUserId, name } = payload;

    // 1. Idempotency Check (sourceEventId unique)
    const existingByEvent = await this.prisma.curationRequest.findUnique({
      where: { sourceEventId: eventId },
    });
    if (existingByEvent) {
      this.logger.log(`Curation request for event ${eventId} already exists. Skipping.`);
      return;
    }

    // 2. Prevent duplicate active (PENDING) request for same profile
    const activeRequest = await this.prisma.curationRequest.findFirst({
      where: {
        workerProfileId,
        status: CurationStatus.PENDING,
      },
    });
    if (activeRequest) {
      this.logger.warn(`Active pending curation request for workerProfileId ${workerProfileId} already exists. Skipping.`);
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      const request = await tx.curationRequest.create({
        data: {
          workerProfileId,
          ownerUserId,
          status: CurationStatus.PENDING,
          sourceEventId: eventId,
        },
      });

      await tx.curationHistory.create({
        data: {
          requestId: request.id,
          fromStatus: null,
          toStatus: CurationStatus.PENDING,
          actorUserId: envelope.actor?.userId || "SYSTEM",
          notes: `Perfil comercial "${name}" submetido para curadoria.`,
        },
      });
    });

    this.logger.log(`Created curation request for workerProfileId: ${workerProfileId}`);
  }

  async handleReviewSubmitted(envelope: any): Promise<void> {
    const eventId = envelope.eventId;
    const payload = envelope.payload;

    if (!payload?.workerProfileId || payload?.rating === undefined) {
      this.logger.warn(`Invalid review.submitted.v1 payload`);
      return;
    }

    const { workerProfileId, rating, reviewId } = payload;

    // Idempotency check for ModerationAlert
    const existingAlert = await this.prisma.moderationAlert.findUnique({
      where: { sourceEventId: eventId },
    });
    if (existingAlert) {
      this.logger.log(`Moderation alert for review event ${eventId} already exists. Skipping.`);
      return;
    }

    if (rating <= 2) {
      const severity = rating === 1 ? "HIGH" : "MEDIUM";
      await this.prisma.moderationAlert.create({
        data: {
          type: "LOW_RATING",
          workerProfileId,
          sourceEventId: eventId,
          severity,
          status: "OPEN",
          payload: { reviewId, rating } as any,
        },
      });
      this.logger.log(`Created low rating moderation alert for reviewId ${reviewId}`);
    }
  }

  // ── REST API Methods ──

  async approve(id: string, dto: ApproveRequestDto, reviewer: AuthenticatedUser) {
    const correlationId = this.correlationService.getCorrelationId();

    const request = await this.prisma.curationRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException(`Curation request with ID "${id}" not found`);
    }
    if (request.status !== CurationStatus.PENDING) {
      throw new ConflictException(`Curation request is not PENDING (current status: ${request.status})`);
    }

    const notes = dto.notes || "Documentação validada";
    const decidedAt = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      const r = await tx.curationRequest.update({
        where: { id },
        data: {
          status: CurationStatus.APPROVED,
          reviewerUserId: reviewer.sub,
          notes,
          decidedAt,
        },
      });

      await tx.curationHistory.create({
        data: {
          requestId: id,
          fromStatus: CurationStatus.PENDING,
          toStatus: CurationStatus.APPROVED,
          actorUserId: reviewer.sub,
          notes,
        },
      });

      // Outbox Event: worker.profile.approved.v1
      await tx.outboxEvent.create({
        data: {
          id: randomUUID(),
          eventName: "worker.profile.approved.v1",
          version: 1,
          occurredAt: decidedAt,
          correlationId,
          producer: "service-curation",
          actor: { userId: reviewer.sub, role: reviewer.role } as any,
          payload: {
            curationRequestId: id,
            workerProfileId: r.workerProfileId,
            reviewerId: reviewer.sub,
            notes,
            decidedAt: decidedAt.toISOString(),
          } as any,
          status: "PENDING",
          attempts: 0,
        },
      });

      // Outbox Event: notification.requested.v1
      await tx.outboxEvent.create({
        data: {
          id: randomUUID(),
          eventName: "notification.requested.v1",
          version: 1,
          occurredAt: decidedAt,
          correlationId,
          producer: "service-curation",
          actor: { userId: reviewer.sub, role: reviewer.role } as any,
          payload: {
            recipientUserId: r.ownerUserId,
            type: "CURATION_APPROVED",
            title: "Perfil aprovado",
            message: "Seu perfil já está visível para turistas.",
            channels: ["IN_APP"],
          } as any,
          status: "PENDING",
          attempts: 0,
        },
      });

      return r;
    });

    return updated;
  }

  async reject(id: string, dto: RejectRequestDto, reviewer: AuthenticatedUser) {
    const correlationId = this.correlationService.getCorrelationId();

    const request = await this.prisma.curationRequest.findUnique({
      where: { id },
    });
    if (!request) {
      throw new NotFoundException(`Curation request with ID "${id}" not found`);
    }
    if (request.status !== CurationStatus.PENDING) {
      throw new ConflictException(`Curation request is not PENDING (current status: ${request.status})`);
    }

    const decidedAt = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      const r = await tx.curationRequest.update({
        where: { id },
        data: {
          status: CurationStatus.REJECTED,
          reviewerUserId: reviewer.sub,
          reasonCode: dto.reasonCode,
          notes: dto.notes,
          decidedAt,
        },
      });

      await tx.curationHistory.create({
        data: {
          requestId: id,
          fromStatus: CurationStatus.PENDING,
          toStatus: CurationStatus.REJECTED,
          actorUserId: reviewer.sub,
          notes: `[${dto.reasonCode}] ${dto.notes}`,
        },
      });

      // Outbox Event: worker.profile.rejected.v1
      await tx.outboxEvent.create({
        data: {
          id: randomUUID(),
          eventName: "worker.profile.rejected.v1",
          version: 1,
          occurredAt: decidedAt,
          correlationId,
          producer: "service-curation",
          actor: { userId: reviewer.sub, role: reviewer.role } as any,
          payload: {
            curationRequestId: id,
            workerProfileId: r.workerProfileId,
            reviewerId: reviewer.sub,
            reasonCode: dto.reasonCode,
            notes: dto.notes,
            decidedAt: decidedAt.toISOString(),
          } as any,
          status: "PENDING",
          attempts: 0,
        },
      });

      // Outbox Event: notification.requested.v1
      await tx.outboxEvent.create({
        data: {
          id: randomUUID(),
          eventName: "notification.requested.v1",
          version: 1,
          occurredAt: decidedAt,
          correlationId,
          producer: "service-curation",
          actor: { userId: reviewer.sub, role: reviewer.role } as any,
          payload: {
            recipientUserId: r.ownerUserId,
            type: "CURATION_REJECTED",
            title: "Perfil rejeitado",
            message: `Seu perfil foi rejeitado. Motivo: ${dto.notes}`,
            channels: ["IN_APP"],
          } as any,
          status: "PENDING",
          attempts: 0,
        },
      });

      return r;
    });

    return updated;
  }

  async findOne(id: string) {
    const request = await this.prisma.curationRequest.findUnique({
      where: { id },
      include: {
        history: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!request) {
      throw new NotFoundException(`Curation request with ID "${id}" not found`);
    }
    return request;
  }

  async listPending(query: ListRequestsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      status: CurationStatus.PENDING,
    };
    if (query.workerProfileId) {
      where.workerProfileId = query.workerProfileId;
    }

    const [data, total] = await Promise.all([
      this.prisma.curationRequest.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
      }),
      this.prisma.curationRequest.count({ where }),
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

  async listHistory(query: ListRequestsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {
      status: {
        in: [CurationStatus.APPROVED, CurationStatus.REJECTED, CurationStatus.CANCELLED],
      },
    };
    if (query.status) {
      where.status = query.status as CurationStatus;
    }
    if (query.workerProfileId) {
      where.workerProfileId = query.workerProfileId;
    }

    const [data, total] = await Promise.all([
      this.prisma.curationRequest.findMany({
        where,
        orderBy: { decidedAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.curationRequest.count({ where }),
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

  async listAlerts(query: ListAlertsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.severity) {
      where.severity = query.severity;
    }

    const [data, total] = await Promise.all([
      this.prisma.moderationAlert.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.moderationAlert.count({ where }),
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

  async resolveAlert(id: string) {
    const alert = await this.prisma.moderationAlert.findUnique({
      where: { id },
    });
    if (!alert) {
      throw new NotFoundException(`Moderation alert with ID "${id}" not found`);
    }

    const updated = await this.prisma.moderationAlert.update({
      where: { id },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
      },
    });

    return updated;
  }
}
