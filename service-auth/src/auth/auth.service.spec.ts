import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    profile: {
      create: jest.fn(),
    },
    refreshSession: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    outboxEvent: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("mocked-jwt-token"),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe("register", () => {
    it("should successfully register a tourist and encrypt password", async () => {
      const dto = {
        name: "João Silva",
        email: "joao@test.com",
        password: "securepassword123",
        role: "TOURIST" as const,
      };

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: "user-123",
        email: "joao@test.com",
        passwordHash: "hashed-pass",
        role: Role.TOURIST,
      });

      const result = await service.register(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "joao@test.com" },
      });
      expect(prisma.user.create).toHaveBeenCalled();
      expect(prisma.profile.create).toHaveBeenCalledWith({
        data: {
          userId: "user-123",
          name: "João Silva",
          phone: null,
        },
      });
      expect(result).toEqual({
        id: "user-123",
        email: "joao@test.com",
        role: Role.TOURIST,
      });
      expect((result as any).passwordHash).toBeUndefined();
    });

    it("should throw ConflictException if email is already registered", async () => {
      const dto = {
        name: "João Silva",
        email: "joao@test.com",
        password: "securepassword123",
        role: "TOURIST" as const,
      };

      prisma.user.findUnique.mockResolvedValue({ id: "user-existing" });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should successfully log in a user and return access and refresh tokens", async () => {
      const dto = {
        email: "joao@test.com",
        password: "securepassword123",
      };

      const hashedPassword = await bcrypt.hash("securepassword123", 10);
      const user = {
        id: "user-123",
        email: "joao@test.com",
        passwordHash: hashedPassword,
        role: Role.TOURIST,
        isActive: true,
      };

      prisma.user.findUnique.mockResolvedValue(user);

      const result = await service.login(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "joao@test.com" },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: "user-123",
        role: Role.TOURIST,
        email: "joao@test.com",
      });
      expect(prisma.refreshSession.create).toHaveBeenCalled();
      expect(result.accessToken).toEqual("mocked-jwt-token");
      expect(result.refreshToken).toBeDefined();
    });

    it("should throw UnauthorizedException if user not found", async () => {
      const dto = { email: "none@test.com", password: "some-password" };

      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if password does not match", async () => {
      const dto = { email: "joao@test.com", password: "wrong-password" };

      const hashedPassword = await bcrypt.hash("securepassword123", 10);
      const user = {
        id: "user-123",
        email: "joao@test.com",
        passwordHash: hashedPassword,
        role: Role.TOURIST,
        isActive: true,
      };

      prisma.user.findUnique.mockResolvedValue(user);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("refresh", () => {
    it("should refresh and return rotated tokens", async () => {
      const session = {
        id: "session-123",
        userId: "user-123",
        tokenHash: "some-hash",
        expiresAt: new Date(Date.now() + 100000),
        revokedAt: null,
        user: {
          id: "user-123",
          email: "joao@test.com",
          role: Role.TOURIST,
          isActive: true,
        },
      };

      prisma.refreshSession.findFirst.mockResolvedValue(session);

      const result = await service.refresh("input-token");

      expect(prisma.refreshSession.findFirst).toHaveBeenCalled();
      expect(prisma.refreshSession.update).toHaveBeenCalledWith({
        where: { id: "session-123" },
        data: { revokedAt: expect.any(Date) },
      });
      expect(prisma.refreshSession.create).toHaveBeenCalled();
      expect(result.accessToken).toEqual("mocked-jwt-token");
      expect(result.refreshToken).toBeDefined();
    });

    it("should throw UnauthorizedException if session not found", async () => {
      prisma.refreshSession.findFirst.mockResolvedValue(null);

      await expect(service.refresh("input-token")).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("logout", () => {
    it("should revoke session using refresh token", async () => {
      await service.logout("my-refresh-token");

      expect(prisma.refreshSession.updateMany).toHaveBeenCalledWith({
        where: {
          tokenHash: expect.any(String),
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });
    });

    it("should revoke all active sessions for a user ID", async () => {
      await service.logout(undefined, "user-123");

      expect(prisma.refreshSession.updateMany).toHaveBeenCalledWith({
        where: {
          userId: "user-123",
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    });
  });

  describe("deleteAccount", () => {
    it("should soft-delete user and revoke sessions", async () => {
      const user = {
        id: "user-123",
        email: "joao@test.com",
        role: Role.TOURIST,
        deletedAt: null,
      };

      prisma.user.findUnique.mockResolvedValue(user);

      await service.deleteAccount("user-123", "corr-123");

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: {
          deletedAt: expect.any(Date),
          isActive: false,
        },
      });

      expect(prisma.refreshSession.updateMany).toHaveBeenCalledWith({
        where: {
          userId: "user-123",
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });

      expect(prisma.outboxEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          eventName: "user.account.deleted.v1",
          correlationId: "corr-123",
        }),
      });
    });
  });
});
