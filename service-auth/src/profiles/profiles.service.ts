import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
    });
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }
    return profile;
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    const updated = await this.prisma.profile.update({
      where: { userId },
      data: {
        name: dto.name !== undefined ? dto.name : profile.name,
        bio: dto.bio !== undefined ? dto.bio : profile.bio,
        phone: dto.phone !== undefined ? dto.phone : profile.phone,
        avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : profile.avatarUrl,
      },
    });

    return updated;
  }
}
