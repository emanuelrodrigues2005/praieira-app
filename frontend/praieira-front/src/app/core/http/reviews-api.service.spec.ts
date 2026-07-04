import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReviewsApiService } from './reviews-api.service';

describe('ReviewsApiService', () => {
  let service: ReviewsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(ReviewsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch review summary for a worker', () => {
    const workerId = 'worker-1';
    const mockResponse = {
      data: { averageRating: 4.5, totalReviews: 10, distribution: { '1': 1, '2': 0, '3': 1, '4': 2, '5': 6 } },
      meta: { requestId: 'req-1' },
    };

    service.getSummary(workerId).subscribe((res) => {
      expect(res.data.averageRating).toBe(4.5);
      expect(res.data.totalReviews).toBe(10);
    });

    const req = httpMock.expectOne(`/reviews/worker/${workerId}/summary`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch paginated reviews for a worker', () => {
    const workerId = 'worker-1';
    const mockResponse = {
      data: [
        { id: 'r1', workerProfileId: workerId, touristUserId: 't1', touristName: 'Maria', rating: 5, comment: 'Ótimo!', status: 'PUBLISHED', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1, requestId: 'req-1' },
    };

    service.getReviews(workerId, 1, 10).subscribe((res) => {
      expect(res.data.length).toBe(1);
      expect(res.data[0].rating).toBe(5);
      expect(res.meta.total).toBe(1);
    });

    const req = httpMock.expectOne(`/reviews/worker/${workerId}?page=1&limit=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should register a contact interaction', () => {
    const workerId = 'worker-1';

    service.registerContact(workerId, 'whatsapp').subscribe();

    const req = httpMock.expectOne(`/interactions/contact/${workerId}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ channel: 'whatsapp' });
    req.flush({ data: { id: 'c1' }, meta: { requestId: 'req-1' } });
  });

  // ── getMyReviews ──

  it('should fetch paginated reviews for the authenticated user', () => {
    const mockResponse = {
      data: [
        { id: 'r1', workerProfileId: 'w1', touristUserId: 't1', touristName: null, rating: 4, comment: 'Muito bom!', status: 'PUBLISHED', createdAt: '2026-06-15T00:00:00Z', updatedAt: '2026-06-15T00:00:00Z' },
        { id: 'r2', workerProfileId: 'w2', touristUserId: 't1', touristName: null, rating: 5, comment: 'Excelente!', status: 'PUBLISHED', createdAt: '2026-02-10T00:00:00Z', updatedAt: '2026-02-10T00:00:00Z' },
      ],
      meta: { page: 1, limit: 10, total: 2, totalPages: 1, requestId: 'req-1' },
    };

    service.getMyReviews(1, 10).subscribe((res) => {
      expect(res.data.length).toBe(2);
      expect(res.data[0].rating).toBe(4);
      expect(res.meta.total).toBe(2);
    });

    const req = httpMock.expectOne(`/reviews/me?page=1&limit=10`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // ── updateReview ──

  it('should update a review rating and comment', () => {
    const reviewId = 'r1';

    service.updateReview(reviewId, { rating: 3, comment: 'Ok' }).subscribe((res) => {
      expect(res.data.rating).toBe(3);
      expect(res.data.comment).toBe('Ok');
    });

    const req = httpMock.expectOne(`/reviews/${reviewId}`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ rating: 3, comment: 'Ok' });
    req.flush({ data: { id: 'r1', rating: 3, comment: 'Ok' }, meta: { requestId: 'req-1' } });
  });

  // ── deleteReview ──

  it('should delete a review', () => {
    const reviewId = 'r1';

    service.deleteReview(reviewId).subscribe();

    const req = httpMock.expectOne(`/reviews/${reviewId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ── createReview ──

  it('should create a new review for a worker profile', () => {
    const workerId = 'w1';
    const body = { rating: 5, comment: 'Excelente!' };

    service.createReview(workerId, body).subscribe((res) => {
      expect(res.data.rating).toBe(5);
      expect(res.data.comment).toBe('Excelente!');
      expect(res.data.workerProfileId).toBe(workerId);
    });

    const req = httpMock.expectOne(`/reviews`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ workerProfileId: workerId, ...body });
    req.flush({
      data: { id: 'r2', workerProfileId: workerId, touristUserId: 't1', touristName: null, rating: 5, comment: 'Excelente!', status: 'PUBLISHED', createdAt: '2026-06-20T00:00:00Z', updatedAt: '2026-06-20T00:00:00Z' },
      meta: { requestId: 'req-2' },
    });
  });
});
