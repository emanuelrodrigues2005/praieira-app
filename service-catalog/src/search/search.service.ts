import { Injectable, BadRequestException } from "@nestjs/common";
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
  distance?: number;
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
  constructor(private readonly prisma: PrismaService) {}

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
      conditions.push(
        `ST_DWithin(ST_MakePoint($${paramIndex}::float, $${paramIndex + 1}::float)::geography, ST_MakePoint(longitude, latitude)::geography, $${paramIndex + 2})`,
      );
      params.push(filters.lng, filters.lat, filters.radius);
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

    const orderBy = hasLat && hasLng ? "distance ASC" : "created_at DESC";

    const rows = await this.prisma.$queryRawUnsafe<WorkerProfileSearchResult[]>(
      `SELECT id, name, category, beach, latitude, longitude, phone, whatsapp, description${geoSelect}
       FROM worker_profiles
       WHERE ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${paramIndex + geoParams.length} OFFSET $${paramIndex + geoParams.length + 1}`,
      ...params,
      ...geoParams,
      limit,
      offset,
    );

    return {
      data: rows,
      meta: {
        page,
        limit,
        total,
        totalPages,
        requestId: "",
      },
    };
  }
}
