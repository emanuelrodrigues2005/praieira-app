import { Test, TestingModule } from "@nestjs/testing";
import { ProfilesService } from "./profiles.service";
import { PrismaService } from "../prisma/prisma.service";
import { NotFoundException } from "@nestjs/common";

describe("ProfilesService", () => {
  let service: ProfilesService;
  let prisma: any;

  const mockPrisma = {
    profile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe("findOne", () => {
    it("should return profile if found", async () => {
      const profile = { id: "profile-123", name: "João Silva", phone: "12345" };
      prisma.profile.findUnique.mockResolvedValue(profile);

      const result = await service.findOne("profile-123");

      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { id: "profile-123" },
      });
      expect(result).toEqual(profile);
    });

    it("should throw NotFoundException if profile not found", async () => {
      prisma.profile.findUnique.mockResolvedValue(null);

      await expect(service.findOne("none")).rejects.toThrow(NotFoundException);
    });
  });

  describe("updateMe", () => {
    it("should update and return own profile", async () => {
      const profile = { id: "profile-123", userId: "user-123", name: "João Silva" };
      prisma.profile.findUnique.mockResolvedValue(profile);
      prisma.profile.update.mockResolvedValue({ ...profile, name: "João Alterado" });

      const result = await service.updateMe("user-123", { name: "João Alterado" });

      expect(prisma.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: "user-123" },
      });
      expect(prisma.profile.update).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        data: expect.objectContaining({
          name: "João Alterado",
        }),
      });
      expect(result.name).toEqual("João Alterado");
    });

    it("should throw NotFoundException if profile for user not found", async () => {
      prisma.profile.findUnique.mockResolvedValue(null);

      await expect(service.updateMe("user-none", { name: "Test" })).rejects.toThrow(NotFoundException);
    });
  });
});
