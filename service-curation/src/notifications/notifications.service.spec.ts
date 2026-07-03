import { Test, TestingModule } from "@nestjs/testing";
import { NotificationsService } from "./notifications.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException, ForbiddenException } from "@nestjs/common";

describe("NotificationsService", () => {
  let service: NotificationsService;
  let prisma: any;

  const mockPrisma = {
    notification: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe("handleNotificationRequested (Event Consumer)", () => {
    it("should persist a notification if the channel includes IN_APP", async () => {
      const envelope = {
        eventId: "event-notif-123",
        payload: {
          recipientUserId: "user-456",
          type: "CURATION_APPROVED",
          title: "Aprovado!",
          message: "Seu perfil está visível.",
          channels: ["IN_APP"],
        },
      };

      prisma.notification.findUnique.mockResolvedValue(null);

      await service.handleNotificationRequested(envelope);

      expect(prisma.notification.findUnique).toHaveBeenCalledWith({
        where: { sourceEventId: "event-notif-123" },
      });
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          recipientUserId: "user-456",
          type: "CURATION_APPROVED",
          title: "Aprovado!",
          message: "Seu perfil está visível.",
          channel: "IN_APP",
          status: "SENT",
          sourceEventId: "event-notif-123",
        }),
      });
    });

    it("should skip if sourceEventId already exists (idempotency)", async () => {
      const envelope = {
        eventId: "event-notif-123",
        payload: {
          recipientUserId: "user-456",
          type: "CURATION_APPROVED",
          title: "Aprovado!",
          message: "Seu perfil está visível.",
          channels: ["IN_APP"],
        },
      };

      prisma.notification.findUnique.mockResolvedValue({ id: "notif-123" });

      await service.handleNotificationRequested(envelope);

      expect(prisma.notification.create).not.toHaveBeenCalled();
    });
  });

  describe("listForUser (REST API)", () => {
    it("should return paginated notifications for the user", async () => {
      const query = { page: 1, limit: 10 };
      const notifications = [{ id: "n-1", recipientUserId: "user-abc" }];

      prisma.notification.findMany.mockResolvedValue(notifications);
      prisma.notification.count.mockResolvedValue(1);

      const result = await service.listForUser("user-abc", query);

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { recipientUserId: "user-abc" },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 10,
      });
      expect(result.data).toEqual(notifications);
      expect(result.meta.total).toEqual(1);
    });
  });

  describe("markAsRead (REST API)", () => {
    it("should mark a user notification as read", async () => {
      const notification = { id: "n-1", recipientUserId: "user-abc", status: "SENT" };

      prisma.notification.findUnique.mockResolvedValue(notification);
      prisma.notification.update.mockResolvedValue({ ...notification, status: "READ" });

      const result = await service.markAsRead("n-1", "user-abc");

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: "n-1" },
        data: expect.objectContaining({
          status: "READ",
        }),
      });
      expect(result.status).toEqual("READ");
    });

    it("should throw NotFoundException if notification does not exist", async () => {
      prisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead("n-none", "user-abc")).rejects.toThrow(NotFoundException);
    });

    it("should throw ForbiddenException if user does not own the notification", async () => {
      const notification = { id: "n-1", recipientUserId: "user-other", status: "SENT" };

      prisma.notification.findUnique.mockResolvedValue(notification);

      await expect(service.markAsRead("n-1", "user-abc")).rejects.toThrow(ForbiddenException);
      expect(prisma.notification.update).not.toHaveBeenCalled();
    });
  });
});
