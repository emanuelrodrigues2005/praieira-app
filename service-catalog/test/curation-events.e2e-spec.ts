import { Test, TestingModule } from "@nestjs/testing";
import { Logger } from "@nestjs/common";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { CurationEventsHandler } from "../src/curation-events/curation-events.handler";
import { DomainEvent, ProfileApprovedPayload, ProfileRejectedPayload } from "../src/messaging/domain-event";
import { cleanDatabase } from "./helpers/db-helper";

describe("CurationEventsHandler", () => {
  let handler: CurationEventsHandler;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get(PrismaService);
    handler = moduleFixture.get(CurationEventsHandler);
    await prismaService.$connect();
    await app.init();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  async function createPendingProfile(workerName = "Test Worker") {
    const profile = await prismaService.workerProfile.create({
      data: {
        ownerUserId: "worker-uuid",
        name: workerName,
        category: "barraqueiro",
        latitude: -8.25,
        longitude: -35.0,
        beach: "Gaibu",
        status: "PENDING",
      },
    });
    return profile;
  }

  function makeEvent<T>(payload: T, eventName: string): DomainEvent<T> {
    return {
      eventId: "test-event-id",
      eventName,
      version: 1,
      occurredAt: new Date().toISOString(),
      correlationId: "test-correlation-id",
      producer: "service-curation",
      actor: { userId: "curator-uuid", role: "CURATOR" },
      payload,
    };
  }

  function makeMockContext() {
    const ack = jest.fn();
    const nack = jest.fn();
    return {
      getChannelRef: () => ({ ack, nack }),
      getMessage: () => ({}),
      ack,
      nack,
    } as any;
  }

  // Bullet 2: Approved event updates status
  it("should set profile to APPROVED on approval event", async () => {
    const profile = await createPendingProfile();
    const ctx = makeMockContext();

    await handler.handleProfileApproved(
      makeEvent(
        { profileId: profile.id, reviewerId: "curator-uuid", reviewedAt: new Date().toISOString() },
        "worker.profile.approved.v1",
      ),
      ctx,
    );

    const updated = await prismaService.workerProfile.findUnique({ where: { id: profile.id } });
    expect(updated?.status).toBe("APPROVED");
    expect(updated?.reviewedBy).toBe("curator-uuid");
    expect(updated?.reviewedAt).toBeTruthy();
    expect(ctx.getChannelRef().ack).toHaveBeenCalled();
  });

  // Bullet 3: Rejected event updates status
  it("should set profile to REJECTED on rejection event", async () => {
    const profile = await createPendingProfile();
    const ctx = makeMockContext();

    await handler.handleProfileRejected(
      makeEvent(
        {
          profileId: profile.id,
          reviewerId: "curator-uuid",
          reasonCode: "INVALID_INFO",
          notes: "Informações incompletas",
          reviewedAt: new Date().toISOString(),
        },
        "worker.profile.rejected.v1",
      ),
      ctx,
    );

    const updated = await prismaService.workerProfile.findUnique({ where: { id: profile.id } });
    expect(updated?.status).toBe("REJECTED");
    expect(updated?.rejectedReason).toBe("Informações incompletas");
    expect(updated?.reviewedBy).toBe("curator-uuid");
    expect(ctx.getChannelRef().ack).toHaveBeenCalled();
  });

  // Bullet 4: Idempotency — skip if not PENDING
  it("should skip if profile is not PENDING (idempotent)", async () => {
    const profile = await createPendingProfile();
    // First approval should work
    await handler.handleProfileApproved(
      makeEvent(
        { profileId: profile.id, reviewerId: "curator-uuid", reviewedAt: new Date().toISOString() },
        "worker.profile.approved.v1",
      ),
      makeMockContext(),
    );

    const updated = await prismaService.workerProfile.findUnique({ where: { id: profile.id } });
    expect(updated?.status).toBe("APPROVED");

    // Second approval should skip (already APPROVED)
    const ctx2 = makeMockContext();
    jest.spyOn(Logger.prototype, "warn").mockImplementation(() => {});
    await handler.handleProfileApproved(
      makeEvent(
        { profileId: profile.id, reviewerId: "curator-uuid", reviewedAt: new Date().toISOString() },
        "worker.profile.approved.v1",
      ),
      ctx2,
    );

    // Should have ack'd the duplicate without error
    expect(ctx2.getChannelRef().ack).toHaveBeenCalled();
    // Status should still be APPROVED (not changed again)
    const stillApproved = await prismaService.workerProfile.findUnique({ where: { id: profile.id } });
    expect(stillApproved?.status).toBe("APPROVED");
    jest.restoreAllMocks();
  });

  // Bullet 5: Non-existent profile → ack without error
  it("should ack event for non-existent profile without error", async () => {
    const ctx = makeMockContext();
    jest.spyOn(Logger.prototype, "warn").mockImplementation(() => {});

    await handler.handleProfileApproved(
      makeEvent(
        { profileId: "nonexistent-profile-id", reviewerId: "curator-uuid", reviewedAt: new Date().toISOString() },
        "worker.profile.approved.v1",
      ),
      ctx,
    );

    expect(ctx.getChannelRef().ack).toHaveBeenCalled();
    jest.restoreAllMocks();
  });
});
