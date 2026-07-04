import { Injectable, inject, InjectionToken } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkerProfile, SuccessResponse } from '../models';

export const CATALOG_API_BASE_URL = new InjectionToken<string>('CATALOG_API_BASE_URL', {
  providedIn: 'root',
  factory: () => '',
});

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

export interface SearchFilters {
  text?: string;
  beach?: string;
  category?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  sort?: 'proximity' | 'rating';
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class CatalogApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(CATALOG_API_BASE_URL);

  getWorker(id: string): Observable<SuccessResponse<WorkerProfile>> {
    return this.http.get<SuccessResponse<WorkerProfile>>(`${this.baseUrl}/catalog/workers/${id}`);
  }

  search(filters: SearchFilters): Observable<PaginatedResponse<WorkerProfileSearchResult>> {
    let params = new HttpParams();
    if (filters.text) params = params.set('text', filters.text);
    if (filters.beach) params = params.set('beach', filters.beach);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.lat !== undefined) params = params.set('lat', filters.lat);
    if (filters.lng !== undefined) params = params.set('lng', filters.lng);
    if (filters.radius !== undefined) params = params.set('radius', filters.radius);
    if (filters.sort) params = params.set('sort', filters.sort);
    if (filters.page !== undefined) params = params.set('page', filters.page);
    if (filters.limit !== undefined) params = params.set('limit', filters.limit);

    return this.http.get<PaginatedResponse<WorkerProfileSearchResult>>(
      `${this.baseUrl}/catalog/search`,
      { params },
    );
  }
}
