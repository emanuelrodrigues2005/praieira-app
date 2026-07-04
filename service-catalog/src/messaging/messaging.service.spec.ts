import { Test, TestingModule } from "@nestjs/testing";
import { ClientProxy } from "@nestjs/microservices";
import { MessagingService } from "./messaging.service";
import { of } from "rxjs";

describe("MessagingService", () => {
  let messagingService: MessagingService;
  const mockEmit = jest.fn().mockReturnValue(of({}));

  const mockClientProxy = {
    emit: mockEmit,
    send: jest.fn(),
    connect: jest.fn(),
    close: jest.fn(),
  } as unknown as ClientProxy;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingService,
        {
          provide: "RMQ_CLIENT",
          useValue: mockClientProxy,
        },
      ],
    }).compile();

    messagingService = moduleFixture.get(MessagingService);
  });

  it("should emit profile.viewed.v1 event with correct payload", () => {
    const payload = {
      profileId: "test-profile-id",
      viewerRole: "TOURIST",
      beach: "Gaibu",
      timestamp: new Date().toISOString(),
    };

    messagingService.emitProfileViewed(payload);

    expect(mockEmit).toHaveBeenCalledWith("profile.viewed.v1", payload);
    expect(mockEmit).toHaveBeenCalledTimes(1);
  });

  it("should not block when emit is called (fire-and-forget)", () => {
    const payload = {
      profileId: "test-profile-id-2",
      viewerRole: "UNAUTHENTICATED",
      beach: "Porto de Galinhas",
      timestamp: new Date().toISOString(),
    };

    // Should not throw
    expect(() => messagingService.emitProfileViewed(payload)).not.toThrow();
  });
});
