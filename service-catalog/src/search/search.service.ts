import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SearchQueryDto } from "./dto/search-query.dto";

export interface WorkerProfileSearchResult {
  id: string;
  name: string;
  category: string;
  beach: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  whatsapp: string | null;
  description: string | null;
  coverImage: string | null;
  gallery: string[];
  tags: string[];
  businessHours: Record<string, { open: string; close: string }> | null;
  distance?: number;
  averageRating?: number;
  totalReviews?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  requestId: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly reviewsBaseUrl: string;

  constructor(private readonly prisma: PrismaService) {
    this.reviewsBaseUrl =
      process.env.REVIEWS_URL ?? "http://localhost:3003";
  }

  async search(filters: SearchQueryDto): Promise<PaginatedResponse<WorkerProfileSearchResult>> {
    // Validate geo params
    const hasLat = filters.lat !== undefined;
    const hasLng = filters.lng !== undefined;
    const hasRadius = filters.radius !== undefined;

    if ((hasLat || hasLng || hasRadius) && !(hasLat && hasLng && hasRadius)) {
      throw new BadRequestException(
        "lat, lng, and radius must all be provided together",
      );
    }

    const conditions: string[] = ["status = 'APPROVED'"];
    const params: any[] = [];
    let paramIndex = 1;

    // Text filter (ILIKE on name and description)
    if (filters.text) {
      conditions.push(
        `(name ILIKE '%' || $${paramIndex} || '%' OR description ILIKE '%' || $${paramIndex} || '%')`,
      );
      params.push(filters.text);
      paramIndex++;
    }

    // Beach exact match
    if (filters.beach) {
      conditions.push(`beach = $${paramIndex}`);
      params.push(filters.beach);
      paramIndex++;
    }

    // Category exact match
    if (filters.category) {
      conditions.push(`category = $${paramIndex}`);
      params.push(filters.category);
      paramIndex++;
    }

    // Geo/radius filter
    if (hasLat && hasLng && hasRadius) {
      const radius = filters.radius!;
      conditions.push(
        `ST_DWithin(ST_MakePoint($${paramIndex}::float, $${paramIndex + 1}::float)::geography, ST_MakePoint(longitude, latitude)::geography, $${paramIndex + 2})`,
      );
      params.push(filters.lng, filters.lat, radius * 1000);
      paramIndex += 3;
    }

    const whereClause = conditions.join(" AND ");

    // Count query
    const countResult = await this.prisma.$queryRawUnsafe<
      Array<{ count: bigint }>
    >(`SELECT COUNT(*) as count FROM worker_profiles WHERE ${whereClause}`, ...params);

    const total = Number(countResult[0].count);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit) || 1;

    // Data query
    const geoSelect =
      hasLat && hasLng
        ? `, ST_Distance(ST_MakePoint($${paramIndex}::float, $${paramIndex + 1}::float)::geography, ST_MakePoint(longitude, latitude)::geography) as distance`
        : "";

    const geoParams =
      hasLat && hasLng ? [filters.lng, filters.lat] : [];

    // Sort logic: "rating" sorts alphabetically by name (full rating sort
    // requires denormalizing average_rating into the catalog DB via events).
    // "proximity" uses geo-distance when lat/lng provided, otherwise defaults
    // to most recently created first.
    let orderBy: string;
    if (filters.sort === "rating") {
      orderBy = "name ASC";
    } else if (hasLat && hasLng) {
      orderBy = "distance ASC";
    } else {
      orderBy = "created_at DESC";
    }

    const rows = await this.prisma.$queryRawUnsafe<WorkerProfileSearchResult[]>(
      `SELECT id, name, category, beach, latitude, longitude, phone, whatsapp, description,
              cover_image as "coverImage", gallery, tags, business_hours as "businessHours"${geoSelect}
       FROM worker_profiles
       WHERE ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${paramIndex + geoParams.length} OFFSET $${paramIndex + geoParams.length + 1}`,
      ...params,
      ...geoParams,
      limit,
      offset,
    );

    // Batch-fetch review ratings for all returned profiles
    const rowsWithRatings = await this.attachRatingsToRows(rows);

    return {
      data: rowsWithRatings,
      meta: {
        page,
        limit,
        total,
        totalPages,
        requestId: "",
      },
    };
  }

  private async attachRatingsToRows(rows: WorkerProfileSearchResult[]): Promise<WorkerProfileSearchResult[]> {
    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.id);

    const ratingMap = new Map<string, { averageRating: number; totalReviews: number }>();

    await Promise.all(
      ids.map(async (id) => {
        try {
          const url = `${this.reviewsBaseUrl}/reviews/worker/${id}/summary`;
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 2000);
          const response = await fetch(url, {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          });
          clearTimeout(timeout);

          if (response.ok) {
            const body = await response.json();
            const summary = body.data;
            ratingMap.set(id, {
              averageRating: summary.averageRating ?? 0,
              totalReviews: summary.totalReviews ?? 0,
            });
          }
        } catch (error: any) {
          this.logger.warn(
            `Failed to fetch ratings for profile ${id}: ${error.message}`,
          );
        }
      }),
    );

    return rows.map((row) => {
      const ratings = ratingMap.get(row.id);
      return {
        ...row,
        averageRating: ratings?.averageRating ?? 0,
        totalReviews: ratings?.totalReviews ?? 0,
      };
    });
  }
}
