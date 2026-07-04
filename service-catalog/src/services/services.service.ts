import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WorkersService } from "../workers/workers.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workersService: WorkersService,
  ) {}

  async create(profileId: string, userId: string, dto: CreateServiceDto) {
    const profile = await this.workersService.verifyProfileOwnership(
      profileId,
      userId,
    );

    return this.prisma.serviceItem.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        category: dto.category,
        latitude: dto.latitude,
        longitude: dto.longitude,
        beach: dto.beach,
        isAvailable: dto.isAvailable ?? true,
        workerId: profileId,
      },
    });
  }

  async update(serviceId: string, userId: string, dto: UpdateServiceDto) {
    const service = await this.prisma.serviceItem.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException("Service item not found");
    }

    // Verify ownership via parent profile
    await this.workersService.verifyProfileOwnership(
      service.workerId,
      userId,
    );

    return this.prisma.serviceItem.update({
      where: { id: serviceId },
      data: dto,
    });
  }

  async delete(serviceId: string, userId: string): Promise<void> {
    const service = await this.prisma.serviceItem.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException("Service item not found");
    }

    // Verify ownership via parent profile
    await this.workersService.verifyProfileOwnership(
      service.workerId,
      userId,
    );

    await this.prisma.serviceItem.delete({
      where: { id: serviceId },
    });
  }
}
