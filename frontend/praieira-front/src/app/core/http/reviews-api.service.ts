import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, ReviewSummary, PaginatedResponse } from '../models';

export interface RegisterContactRequest {
  channel: 'whatsapp' | 'phone';
}

@Injectable({ providedIn: 'root' })
export class ReviewsApiService {
  private readonly http = inject(HttpClient);

  getSummary(workerId: string): Observable<{ data: ReviewSummary; meta: { requestId: string } }> {
    return this.http.get<{ data: ReviewSummary; meta: { requestId: string } }>(
      `/reviews/worker/${workerId}/summary`,
    );
  }

  getReviews(workerId: string, page = 1, limit = 10): Observable<PaginatedResponse<Review>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PaginatedResponse<Review>>(
      `/reviews/worker/${workerId}`,
      { params },
    );
  }

  registerContact(workerId: string, channel: 'whatsapp' | 'phone'): Observable<{ data: { id: string }; meta: { requestId: string } }> {
    return this.http.post<{ data: { id: string }; meta: { requestId: string } }>(
      `/interactions/contact/${workerId}`,
      { channel },
    );
  }

  getMyReviews(page = 1, limit = 10): Observable<PaginatedResponse<Review>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    return this.http.get<PaginatedResponse<Review>>(`/reviews/me`, { params });
  }

  updateReview(id: string, body: { rating?: number; comment?: string }): Observable<{ data: Review; meta: { requestId: string } }> {
    return this.http.patch<{ data: Review; meta: { requestId: string } }>(`/reviews/${id}`, body);
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`/reviews/${id}`);
  }
}
