import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Inject,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CATALOG_CLIENT, CatalogClient } from "../catalog/catalog-client.interface";
import { CorrelationService } from "../common/correlation/correlation.service";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { ListFavoritesQueryDto } from "./dto/list-favorites-query.dto";
import { Prisma } from "@prisma/client";

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CATALOG_CLIENT) private readonly catalogClient: CatalogClient,
    private readonly correlationService: CorrelationService,
  ) {}

  async add(workerProfileId: string, user: AuthenticatedUser) {
    // Validate worker profile exists via catalog
    try {
      await this.catalogClient.getPublicWorkerProfile(workerProfileId);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Catalog validation failed for profile ${workerProfileId}: ${error.message}`);
      throw error;
    }

    const correlationId = this.correlationService.getCorrelationId();

    try {
      const favorite = await this.prisma.$transaction(async (tx) => {
        const f = await tx.favorite.create({
          data: {
            touristUserId: user.sub,
            workerProfileId,
          },
        });

        await tx.outboxEvent.create({
          data: {
            eventName: "favorite.added.v1",
            version: 1,
            occurredAt: new Date(),
            correlationId,
            producer: "service-reviews",
            actor: { userId: user.sub, role: user.role } as any,
            payload: {
              favoriteId: f.id,
              touristUserId: f.touristUserId,
              workerProfileId: f.workerProfileId,
              addedAt: f.createdAt.toISOString(),
            } as any,
            attempts: 0,
          },
        });

        return f;
      });

      return favorite;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException("This worker profile is already in your favorites");
        }
      }
      throw error;
    }
  }

  async remove(favoriteId: string, user: AuthenticatedUser) {
    const favorite = await this.prisma.favorite.findUnique({
      where: { id: favoriteId },
    });

    if (!favorite) {
      throw new NotFoundException("Favorite not found");
    }

    if (favorite.touristUserId !== user.sub) {
      throw new ForbiddenException("You can only remove your own favorites");
    }

    const correlationId = this.correlationService.getCorrelationId();

    await this.prisma.$transaction(async (tx) => {
      await tx.favorite.delete({ where: { id: favoriteId } });

      await tx.outboxEvent.create({
        data: {
          eventName: "favorite.removed.v1",
          version: 1,
          occurredAt: new Date(),
          correlationId,
          producer: "service-reviews",
          actor: { userId: user.sub, role: user.role } as any,
          payload: {
            favoriteId: favorite.id,
            touristUserId: favorite.touristUserId,
            workerProfileId: favorite.workerProfileId,
            removedAt: new Date().toISOString(),
          } as any,
          attempts: 0,
        },
      });
    });
  }

  async list(touristUserId: string, query: ListFavoritesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = { touristUserId };

    const [data, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.favorite.count({ where }),
    ]);

    if (data.length === 0) {
      return {
        data: [],
        meta: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // Fetch worker details from catalog
    const workerIds = [...new Set(data.map((f) => f.workerProfileId))];
    const workerProfiles = new Map<
      string,
      { name: string; category: string; beach: string; coverImage?: string }
    >();

    await Promise.all(
      workerIds.map(async (id) => {
        try {
          const details = await this.catalogClient.getWorkerProfileDetails(id);
          workerProfiles.set(id, {
            name: details.name,
            category: details.category,
            beach: details.beach,
            coverImage: details.coverImage,
          });
        } catch {
          workerProfiles.set(id, {
            name: "Perfil não encontrado",
            category: "",
            beach: "Outros",
          });
        }
      }),
    );

    // Compute ratings for each worker profile from reviews
    const ratingMap = new Map<string, number>();
    if (workerIds.length > 0) {
      const reviews = await this.prisma.review.groupBy({
        by: ["workerProfileId"],
        where: {
          workerProfileId: { in: workerIds },
          status: "PUBLISHED",
        },
        _avg: { rating: true },
      });
      for (const r of reviews) {
        if (r._avg.rating !== null) {
          ratingMap.set(r.workerProfileId, Math.round(r._avg.rating * 10) / 10);
        }
      }
    }

    // Build favorites with worker data
    const favoritesWithWorker = data.map((f) => {
      const wp = workerProfiles.get(f.workerProfileId);
      return {
        id: f.id,
        workerProfileId: f.workerProfileId,
        worker: {
          name: wp?.name ?? "Perfil não encontrado",
          category: wp?.category ?? "",
          beach: wp?.beach ?? "Outros",
          coverImage: wp?.coverImage ?? null,
        },
        rating: ratingMap.get(f.workerProfileId) ?? 0,
        createdAt: f.createdAt,
      };
    });

    // Group by beach
    const grouped = new Map<string, typeof favoritesWithWorker>();
    for (const f of favoritesWithWorker) {
      const beach = f.worker.beach;
      if (!grouped.has(beach)) {
        grouped.set(beach, []);
      }
      grouped.get(beach)!.push(f);
    }

    const groupedData = Array.from(grouped.entries()).map(([beach, favorites]) => ({
      beach,
      favorites,
    }));

    return {
      data: groupedData,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
