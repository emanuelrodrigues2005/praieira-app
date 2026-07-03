import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ListNotificationsQueryDto } from "./dto/list-notifications-query.dto";
import { randomUUID } from "crypto";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── RMQ Event Consumers ──

  async handleNotificationRequested(envelope: any): Promise<void> {
    const eventId = envelope.eventId;
    const payload = envelope.payload;

    if (!payload?.recipientUserId || !payload?.type || !payload?.title || !payload?.message) {
      this.logger.warn(`Invalid notification.requested.v1 payload`);
      return;
    }

    const { recipientUserId, type, title, message, channels } = payload;

    // Idempotency check using sourceEventId
    const existing = await this.prisma.notification.findUnique({
      where: { sourceEventId: eventId },
    });
    if (existing) {
      this.logger.log(`Notification for request event ${eventId} already exists. Skipping.`);
      return;
    }

    // Persist notification for IN_APP channel
    const hasInApp = channels?.includes("IN_APP") ?? true;
    if (hasInApp) {
      await this.prisma.notification.create({
        data: {
          recipientUserId,
          type,
          title,
          message,
          channel: "IN_APP",
          status: "SENT",
          sentAt: new Date(),
          sourceEventId: eventId,
        },
      });
      this.logger.log(`Created IN_APP notification for user ${recipientUserId}`);
    }
  }

  // ── REST API Methods ──

  async listForUser(userId: string, query: ListNotificationsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      recipientUserId: userId,
    };

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
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

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID "${id}" not found`);
    }

    if (notification.recipientUserId !== userId) {
      throw new ForbiddenException(`You can only mark your own notifications as read`);
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: {
        status: "READ",
        readAt: new Date(),
      },
    });

    return updated;
  }
}
