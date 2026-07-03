import { Test, TestingModule } from "@nestjs/testing";
import { CurationService } from "./curation.service";
import { PrismaService } from "../prisma/prisma.service";
import { CorrelationService } from "../common/correlation/correlation.service";
import { CurationStatus } from "@prisma/client";
import { NotFoundException, ConflictException } from "@nestjs/common";

describe("CurationService", () => {
  let service: CurationService;
  let prisma: any;
  let correlationService: any;

  const mockPrisma = {
    curationRequest: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    curationHistory: {
      create: jest.fn(),
    },
    moderationAlert: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    outboxEvent: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  const mockCorrelationService = {
    getCorrelationId: jest.fn().mockReturnValue("test-correlation-id"),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurationService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CorrelationService, useValue: mockCorrelationService },
      ],
    }).compile();

    service = module.get<CurationService>(CurationService);
    prisma = module.get<PrismaService>(PrismaService);
    correlationService = module.get<CorrelationService>(CorrelationService);
  });

  describe("handleProfileSubmitted (Event Consumer)", () => {
    it("should create a curation request and history log when profile is submitted", async () => {
      const envelope = {
        eventId: "event-123",
        correlationId: "corr-123",
        actor: { userId: "user-abc", role: "WORKER" },
        payload: {
          workerProfileId: "profile-123",
          ownerUserId: "owner-456",
          name: "Barraca do Sol",
        },
      };

      prisma.curationRequest.findUnique.mockResolvedValue(null);
      prisma.curationRequest.findFirst.mockResolvedValue(null);
      prisma.curationRequest.create.mockResolvedValue({ id: "req-123", workerProfileId: "profile-123" });

      await service.handleProfileSubmitted(envelope);

      expect(prisma.curationRequest.findUnique).toHaveBeenCalledWith({
        where: { sourceEventId: "event-123" },
      });
      expect(prisma.curationRequest.create).toHaveBeenCalled();
      expect(prisma.curationHistory.create).toHaveBeenCalled();
    });

    it("should skip request creation if sourceEventId already exists (idempotency)", async () => {
      const envelope = {
        eventId: "event-123",
        payload: { workerProfileId: "profile-123", ownerUserId: "owner-456" },
      };

      prisma.curationRequest.findUnique.mockResolvedValue({ id: "req-123" });

      await service.handleProfileSubmitted(envelope);

      expect(prisma.curationRequest.create).not.toHaveBeenCalled();
    });

    it("should skip request creation if there is already a PENDING request for the profile", async () => {
      const envelope = {
        eventId: "event-999",
        payload: { workerProfileId: "profile-123", ownerUserId: "owner-456" },
      };

      prisma.curationRequest.findUnique.mockResolvedValue(null);
      prisma.curationRequest.findFirst.mockResolvedValue({ id: "req-active", status: CurationStatus.PENDING });

      await service.handleProfileSubmitted(envelope);

      expect(prisma.curationRequest.create).not.toHaveBeenCalled();
    });
  });

  describe("handleReviewSubmitted (Event Consumer)", () => {
    it("should create a ModerationAlert if rating is <= 2", async () => {
      const envelope = {
        eventId: "review-event-123",
        payload: {
          reviewId: "rev-456",
          workerProfileId: "profile-123",
          rating: 2,
        },
      };

      prisma.moderationAlert.findUnique.mockResolvedValue(null);

      await service.handleReviewSubmitted(envelope);

      expect(prisma.moderationAlert.create).toHaveBeenCalledWith({
        data: {
          type: "LOW_RATING",
          workerProfileId: "profile-123",
          sourceEventId: "review-event-123",
          severity: "MEDIUM",
          status: "OPEN",
          payload: { reviewId: "rev-456", rating: 2 },
        },
      });
    });

    it("should not create a ModerationAlert if rating is > 2", async () => {
      const envelope = {
        eventId: "review-event-789",
        payload: {
          reviewId: "rev-789",
          workerProfileId: "profile-123",
          rating: 4,
        },
      };

      prisma.moderationAlert.findUnique.mockResolvedValue(null);

      await service.handleReviewSubmitted(envelope);

      expect(prisma.moderationAlert.create).not.toHaveBeenCalled();
    });
  });

  describe("approve (REST API)", () => {
    const reviewer = { sub: "rev-user", role: "CURATOR" as const, email: "curator@test.com" };

    it("should approve request and create outbox events", async () => {
      const request = {
        id: "req-123",
        workerProfileId: "profile-123",
        ownerUserId: "owner-456",
        status: CurationStatus.PENDING,
      };

      prisma.curationRequest.findUnique.mockResolvedValue(request);
      prisma.curationRequest.update.mockResolvedValue({ ...request, status: CurationStatus.APPROVED });

      const result = await service.approve("req-123", { notes: "Aprovado!" }, reviewer);

      expect(prisma.curationRequest.update).toHaveBeenCalledWith({
        where: { id: "req-123" },
        data: expect.objectContaining({
          status: CurationStatus.APPROVED,
          reviewerUserId: "rev-user",
          notes: "Aprovado!",
        }),
      });
      expect(prisma.curationHistory.create).toHaveBeenCalled();
      expect(prisma.outboxEvent.create).toHaveBeenCalledTimes(2); // approved + notification
      expect(result.status).toEqual(CurationStatus.APPROVED);
    });

    it("should throw NotFoundException if request does not exist", async () => {
      prisma.curationRequest.findUnique.mockResolvedValue(null);

      await expect(service.approve("req-none", {}, reviewer)).rejects.toThrow(NotFoundException);
    });

    it("should throw ConflictException if request is not PENDING", async () => {
      prisma.curationRequest.findUnique.mockResolvedValue({
        id: "req-123",
        status: CurationStatus.APPROVED,
      });

      await expect(service.approve("req-123", {}, reviewer)).rejects.toThrow(ConflictException);
    });
  });

  describe("reject (REST API)", () => {
    const reviewer = { sub: "rev-user", role: "CURATOR" as const, email: "curator@test.com" };

    it("should reject request, log reason, and queue outbox events", async () => {
      const request = {
        id: "req-123",
        workerProfileId: "profile-123",
        ownerUserId: "owner-456",
        status: CurationStatus.PENDING,
      };

      prisma.curationRequest.findUnique.mockResolvedValue(request);
      prisma.curationRequest.update.mockResolvedValue({ ...request, status: CurationStatus.REJECTED });

      const result = await service.reject(
        "req-123",
        { reasonCode: "INCOMPLETE_INFO", notes: "Sem telefone" },
        reviewer,
      );

      expect(prisma.curationRequest.update).toHaveBeenCalledWith({
        where: { id: "req-123" },
        data: expect.objectContaining({
          status: CurationStatus.REJECTED,
          reviewerUserId: "rev-user",
          reasonCode: "INCOMPLETE_INFO",
          notes: "Sem telefone",
        }),
      });
      expect(prisma.curationHistory.create).toHaveBeenCalled();
      expect(prisma.outboxEvent.create).toHaveBeenCalledTimes(2); // rejected + notification
      expect(result.status).toEqual(CurationStatus.REJECTED);
    });
  });
});
