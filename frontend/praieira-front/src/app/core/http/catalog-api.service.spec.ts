import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CatalogApiService } from './catalog-api.service';

describe('CatalogApiService', () => {
  let service: CatalogApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(CatalogApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should GET /catalog/search with query params', () => {
    service.search({ text: 'buggy', beach: 'Gaibu', limit: 6 }).subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/catalog/search' &&
        request.method === 'GET',
    );
    expect(req.request.params.get('text')).toBe('buggy');
    expect(req.request.params.get('beach')).toBe('Gaibu');
    expect(req.request.params.get('limit')).toBe('6');
    req.flush({ data: [], meta: { page: 1, limit: 6, total: 0, totalPages: 1, requestId: 'r1' } });
  });

  it('should return a PaginatedResponse with WorkerProfileSearchResult items', () => {
    const mockResponse = {
      data: [
        {
          id: 'w1',
          name: 'Barraca do João',
          category: 'Restaurante',
          beach: 'Gaibu',
          latitude: -8.289,
          longitude: -34.948,
          phone: '81999999999',
          whatsapp: '81999999999',
          description: 'Comida típica',
          coverImage: null,
          gallery: [],
          tags: ['peixe', 'praia'],
          businessHours: null,
        },
      ],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1, requestId: 'r1' },
    };

    service.search({}).subscribe((res) => {
      expect(res.data.length).toBe(1);
      expect(res.data[0].name).toBe('Barraca do João');
      expect(res.data[0].category).toBe('Restaurante');
      expect(res.meta.total).toBe(1);
    });

    const req = httpMock.expectOne('/catalog/search');
    req.flush(mockResponse);
  });

  it('should call search without query params when given empty object', () => {
    service.search({}).subscribe();

    const req = httpMock.expectOne('/catalog/search');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 1, requestId: 'r1' } });
  });

  it('should GET a single worker profile by id', () => {
    const workerId = 'worker-1';
    const mockResponse = {
      data: {
        id: workerId,
        ownerUserId: 'u1',
        name: 'Barraca do João',
        description: 'Comida típica',
        category: 'Restaurante',
        phone: '81999999999',
        whatsapp: '81999999999',
        latitude: -8.289,
        longitude: -34.948,
        beach: 'Gaibu',
        status: 'APPROVED',
        coverImage: null,
        gallery: [],
        tags: ['peixe', 'praia'],
        businessHours: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-06-01T00:00:00Z',
      },
      meta: { requestId: 'req-1' },
    };

    service.getWorker(workerId).subscribe((res) => {
      expect(res.data.id).toBe(workerId);
      expect(res.data.name).toBe('Barraca do João');
      expect(res.data.status).toBe('APPROVED');
    });

    const req = httpMock.expectOne(`/catalog/workers/${workerId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
